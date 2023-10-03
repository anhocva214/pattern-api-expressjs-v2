export default class BaseModel{
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    
    constructor(obj: {
        _id?: string;
        id?: string;
        createdAt: Date;
        updatedAt: Date;
    }){
        this.id = obj?.id || obj?._id || '';
        this.createdAt = obj?.createdAt || null;
        this.updatedAt = obj?.updatedAt || null;
    }

    preCreate(){
        delete this.id;
        this.createdAt = new Date();
        this.updatedAt = this.createdAt
    }

    preUpdate(){
        delete this.id;
        delete this.createdAt;
        this.updatedAt = new Date();
    }
    
}