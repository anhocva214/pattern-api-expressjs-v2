import { ENV } from "@helpers/env.helper";
import { Couple, CoupleModel, CoupleResponse } from "@models/couple.model";
import { AppError } from "@models/error";
import { Notification, NotificationModel } from "@models/notification.model";
import { FileUpload } from "@models/upload.model";
import { User, UserModel } from "@models/user.model";
import CloudinaryService from "@services/cloudinary.service";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import MeiliSearch, { Hits } from "meilisearch";
import { FilterQuery } from "mongoose";

export default class UserService {
  private cloudinaryService: CloudinaryService;
  private client: MeiliSearch;
  private searchIndex: string;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
    this.client = new MeiliSearch({
      host: ENV.MEILI_HOST || "",
      apiKey: ENV.MEILI_MASTER_KEY || "",
    });
    this.searchIndex = `${ENV.NODE_ENV}__USER`;
    this.initMeilisearch();
  }

  async update(
    userId: string,
    obj: {
      avatarFile: FileUpload;
      fullname: string;
      birthday: Date;
      gender: string;
    }
  ) {
    let user = new User((await UserModel.findById(userId)) as any);

    if (obj.avatarFile.path) {
      let avatarURL = await this.cloudinaryService.upload(obj.avatarFile);
      if (user.avatarURL) await this.cloudinaryService.delete(user.avatarURL);
      user.avatarURL = avatarURL;
    }

    await UserModel.updateOne(
      { _id: userId },
      {
        avatarURL: user.avatarURL,
        fullname: obj.fullname,
        birthday: obj.birthday,
        gender: obj?.gender,
        updatedInfo: true,
        updatedAt: new Date(),
      }
    );

    let newUser = new User((await UserModel.findById(userId)) as any);
    await this.updateDataSearch(userId);

    return newUser.toDataResponse();
  }

  private async initMeilisearch() {
    try {
      let info = await this.client.index(this.searchIndex).getRawInfo();
      await this.client
        .index(this.searchIndex)
        .updateSearchableAttributes(["phoneNumber", "fullname", "birthday"]);
      await this.client
        .index(this.searchIndex)
        .updateRankingRules([
          "words",
          "typo",
          "proximity",
          "attribute",
          "exactness",
        ]);
    } catch (err) {
      console.log(
        "🚀 ~ file: meilisearch.store.ts ~ line 33 ~ MeilisearchStore ~ initRealEstateAsset ~ err",
        err
      );
      this.client.createIndex(this.searchIndex, { primaryKey: "id" });
      await this.initMeilisearch();
    }
  }

  async asyncSearch() {
    await this.client.index(this.searchIndex).deleteAllDocuments();
    let data = (await UserModel.find({})).map((item) =>
      new User(item).toDataSearch()
    );
    await this.client
      .index(this.searchIndex)
      .addDocuments(data, { primaryKey: "id" });
  }

  async addDataSearch(userId: string) {
    let data = new User((await UserModel.findById(userId)) as any);
    await this.client
      .index(this.searchIndex)
      .addDocuments([data.toDataSearch()], { primaryKey: "id" });
  }

  async updateDataSearch(userId: string) {
    let data = new User((await UserModel.findById(userId)) as any);
    await this.client
      .index(this.searchIndex)
      .updateDocuments([data.toDataSearch()], { primaryKey: "id" });
  }

  async search(text: string) {
    let result = await this.client.index(this.searchIndex).search<User>(text, {
      attributesToHighlight: ["*"],
    });

    return {
      data: result.hits,
      totalRecords: result.estimatedTotalHits,
    };
  }

  private async getParent(userId: string){
    let couple = new CoupleResponse(await CoupleModel.findOne({
      $or: [{ userRequestId: userId }, { userApproveId: userId }],
      status: "dating",
    })
      .populate("userApproveId")
      .populate("userRequestId") as any);

    let parent: User = new User({});

    if (couple?.id  && couple.userApprove.id != userId){
      parent = new User(couple.userApprove)
    }
    else if (couple?.id  && couple.userRequest.id != userId){
      parent = new User(couple.userRequest)
    }

    return parent.id ? parent.toDataSearch() : null
  }

  async getList(params: {
    page: number;
    limit: number;
    search: string;
    role: string;
    locked: boolean;
  }) {
    let { page, limit, search, role, locked } = params;
    let dataSearched: Hits<User> = [],
      totalRecordsSearched = 0;
    if (search) {
      let { data, totalRecords: total } = await this.search(search);
      totalRecordsSearched = total;
      dataSearched = data;
    }

    const idsSearched = dataSearched.map((item) => item.id || "");

    const filterQuery: FilterQuery<User> = {
      ...(!!search && {
        _id: { $in: idsSearched },
      }),
      updatedInfo: true,
    };

    let dataModel = UserModel.find(filterQuery).sort({ createdAt: -1 });

    if (!search) {
      dataModel.skip(limit * (page - 1)).limit(limit);
    }

    let data = await Promise.all(
      (
        await dataModel
      ).map(async (item) => {
        let obj = new User(item).toDataResponse();
        
        let parent = await this.getParent(obj?.id || "")

        if (search) {
          let formatted = dataSearched.find(
            (item) => item.id == obj.id
          )?._formatted;

          return {
            ...obj,
            parent,
            _formatted: {
              phoneNumber: formatted?.phoneNumber,
              fullname: formatted?.fullname,
              birthday: formatted?.birthday,
            },
          };
        } else {
          return { ...obj, parent };
        }
      })
    );

    if (search) {
      data.sort(
        (a, b) =>
          idsSearched.findIndex((id) => a.id == id) -
          idsSearched.findIndex((id) => b.id == id)
      );
      data = data.slice(limit * (page - 1), limit * (page - 1) + limit);
    }

    let totalRecords = await UserModel.count(filterQuery);
    return {
      data,
      paginate: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit),
        ...(totalRecordsSearched > 0 ? { totalRecords } : {}),
      },
    };
  }

  async getMyInfo(user: User){
    let parent = await this.getParent(user?.id || "")
    return {...user, parent}
  }

  async requestDating(user: User, parentId: string) {
    let checkCouple = await CoupleModel.exists({
      userRequestId: parentId,
      userApproveId: user.id,
      status: "requesting",
    });
    if (checkCouple) {
      throw new AppError({
        message: `Đối phương đã yêu cầu xác thực với bạn, vui lòng kiểm tra thông báo`,
        where: "user.service.requestDating",
        statusCode: StatusCodes.BAD_REQUEST,
        detail: "",
      });
    }

    let couple = new Couple({
      userRequestId: user.id,
      userApproveId: parentId,
      status: "requesting",
    });
    couple.preCreate();
    let newCouple = new Couple(await CoupleModel.create(couple));

    let notification = new Notification({
      message: `${_.capitalize(
        user.fullname
      )} vừa gửi cho bạn một yêu cầu xác thực ghép đôi`,
      type: "request_dating",
      toUserIds: [parentId],
      data: {
        coupleId: newCouple.id,
        userRequest: {
          fullname: user.fullname,
          avatarUrl: user.avatarURL,
          birthday: user.birthday,
          gender: user.gender,
        },
      },
    });

    notification.preCreate();
    await NotificationModel.create(notification);
  }

  async approveDating(user: User, coupleId: string) {


    let couple = new Couple((await CoupleModel.findById(coupleId)) as any);
    let checkDating  = await CoupleModel.exists({
      userRequestId: couple.userRequestId,
      status: "dating"
    })

    if (checkDating){
      throw new AppError({
        message: `Đối phương đã được ghép đôi với người khác`,
        where: "user.service.requestDating",
        statusCode: StatusCodes.BAD_REQUEST,
        detail: "",
      })
    }

    await CoupleModel.updateOne({ _id: coupleId }, { status: "dating" });

    let notification = new Notification({
      message: `${_.capitalize(
        user.fullname
      )} đã chấp nhận yêu cầu xác thực ghép đôi của bạn`,
      type: "request_dating",
      toUserIds: [couple.userRequestId],
    });

    notification.preCreate();
    await NotificationModel.create(notification);
  }

  async getMyNotifications(userId: string) {
    let data = (
      await NotificationModel.find({ toUserIds: { $in: [userId] } })
    ).map((item) => new Notification(item));
    return data;
  }
}
