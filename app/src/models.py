from bson import ObjectId
from pydantic import BaseModel, Field
from typing import Optional


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    last_name: str
    email: str
    image: str
    role: str
    is_active: str
    created_at: Optional[str] = None
    last_login: str
    password: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@mail.com",
                "image": "",
                "role": "user",
                "is_active": "false",
                "created_at": "datetime",
                "last_login": "datetime",
                "password": "123456",
            }
        }


class UpdateUserModel(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    role: Optional[str]
    is_active: Optional[str]
    created_at: Optional[str]
    last_login: Optional[str]
    image: Optional[str]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@mail.com",
                "role": "user",
                "is_active": "false",
                "created_at": "datetime",
                "last_login": "datetime",
                "image": "image"
            }
        }


class ShowUserModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    role: Optional[str]
    is_active: Optional[str]
    created_at: Optional[str]
    last_login: Optional[str]
    image: Optional[str]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@mail.com",
                "role": "user",
                "created_at": "datetime",
                "last_login": "datetime",
                "image": "image.jpg"
            }
        }

class AddPost(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    last_name: str
    email: str
    role: str
    created_at: Optional[str] = None
    likesCnt: Optional[int] = 0
    likes: Optional[list] = []
    header: str
    text: str
    photoUrl: str
    avatar: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@mail.com",
                "role": "user",
                "header": "wow",
                "text": "ahaha",
                "created_at": "datetime",
                "photoUrl": "image.jpg"
            }
        }

class ShowPostsModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    role: Optional[str]
    created_at: Optional[str]
    likesCnt: Optional[int]
    likes: Optional[list]
    header: Optional[str]
    text: Optional[str]
    photoUrl: Optional[str]
    avatar: Optional[str]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "johndoe@mail.com",
                "role": "user",
                "header": "wow",
                "likesCnt" : 1,
                "likes" : ["123"],
                "text": "ahaha",
                "created_at": "datetime",
                "photoUrl": "image.jpg",
                "avatar": "image.jpg"
            }
        }
class AddComment(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    last_name: str
    postId: str
    created_at: Optional[str] = None
    text: str
    image: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ShowComments(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    postId: str
    text: Optional[str]
    image: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    created_at: Optional[str]

    class Config:
        json_encoders = {ObjectId: str}

class LikePost(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "userId": "62345678"
        }