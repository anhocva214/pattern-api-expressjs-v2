import { ENV } from "@helpers/env.helper";
import { FileUpload } from "@models/upload.model";
import { User, UserModel } from "@models/user.model";
import CloudinaryService from "@services/cloudinary.service";
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
      updatedInfo: true
    };

    let dataModel = UserModel.find(filterQuery).sort({createdAt: -1});

    if (!search) {
      dataModel.skip(limit * (page - 1)).limit(limit);
    }

    let data = await Promise.all(
      (
        await dataModel
      ).map(async (item) => {
        let obj = (new User(item)).toDataResponse();

        if (search) {
          let formatted = dataSearched.find(
            (item) => item.id == obj.id
          )?._formatted;

          return {
            ...obj,
            _formatted: {
              phoneNumber: formatted?.phoneNumber,
              fullname: formatted?.fullname,
              birthday: formatted?.birthday,
            },
          };
        } else {
          return { ...obj };
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
}
