import { ENV } from "@helpers/env.helper";
import { Product, ProductModel } from "@models/product";
import { MeiliSearch } from "meilisearch";

export default class MeilisearchService {
  private client: MeiliSearch;

  constructor() {
    this.client = new MeiliSearch({
      host: ENV.MEILI_HOST || "",
      apiKey: ENV.MEILI_MASTER_KEY || "",
    });

    this.initProduct();
  }

  async initProduct() {
    try {
      let info = await this.client.index("Product").getRawInfo();
      await this.client
        .index("Product")
        .updateSearchableAttributes([
          "name",
          "categories",
          "author",
          "publicationYear",
          "publisher",
          "attributes",
        ]);
      await this.client
        .index("Product")
        .updateRankingRules([
          "words",
          "typo",
          "proximity",
          "attribute",
          "exactness",
        ]);
      // this.client.index('Product').updateSettings({ pagination: { maxTotalHits: 10000 }})
    } catch (err) {
      console.log(
        "🚀 ~ file: meilisearch.store.ts ~ line 33 ~ MeilisearchStore ~ initRealEstateAsset ~ err",
        err
      );
      this.client.createIndex("Product", { primaryKey: "id" });
      await this.initProduct();
    }
  }

  async asyncDataProduct() {
    let data = await ProductModel.find({})
      .populate({
        path: "categories",
        select: ["name", "slug"],
      })
      .select("-filePDF.url -driveFileId");

    await this.client.index("Product").addDocuments(
      data.map((item) => item.toObject()),
      { primaryKey: "id" }
    );
  }

  async deleteAllDataProduct() {
    await this.client.index("Product").deleteAllDocuments();
    await this.client.deleteIndex("Product");
  }

  async addProduct(id: string) {
    let data = await ProductModel.findById(id)
      .populate({
        path: "categories",
        select: ["name", "slug"],
      })
      .select("-filePDF.url -driveFileId");

    this.client
      .index("Product")
      .addDocuments([data?.toObject() || {}], { primaryKey: "id" });
  }

  async updateProduct(id: string) {
    let data = await ProductModel.findById(id)
      .populate({
        path: "categories",
        select: ["name", "slug"],
      })
      .select("-filePDF.url -driveFileId");
    this.client
      .index("Product")
      .updateDocuments([data?.toObject() || {}], { primaryKey: "id" });
  }

  async removeProduct(id: string) {
    await this.client.index("Product").deleteDocument(id);
  }

  async searchProduct(
    text: string,
    { perPage, page }: { page: number; perPage: number }
  ) {
    let result = await this.client.index("Product").search<Product>(text, {
      attributesToHighlight: ["*"],
      // limit: perPage, // Số lượng kết quả trả về trên mỗi trang
      // offset: (page - 1) * perPage, // Vị trí bắt đầu của kết quả trên trang hiện tại
      limit: 200
    });

    return {
      data: result.hits,
      totalResult: result.estimatedTotalHits,
    };
  }
}
