from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
    UploadFile,
    File
)
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordRequestForm

from .models import (
    UserModel,
    ShowUserModel,
    UpdateUserModel,
    AddPost,
    ShowPostsModel,
    LikePost,
    AddComment,
    ShowComments
)
from .dependecies import (
    get_current_user,
    authenticate_user,
    create_access_token,
    get_password_hash
)
from .settings import db, ACCESS_TOKEN_EXPIRE_MINUTES

from typing import List
from datetime import datetime, timedelta

import re
import shutil
import pymongo
from pathlib import Path

router = APIRouter()

LIM_PAGE = 10

# ============= Creating path operations ==============
@router.post("/", response_description="Add new user", response_model=UserModel)
async def create_user(user: UserModel):
    if re.match("admin|dev|user", user.role):
        datetime_now = datetime.now()
        user.created_at = datetime_now.strftime("%m/%d/%y %H:%M:%S")
        user.password = get_password_hash(user.password)
        user = jsonable_encoder(user)
        new_user = await db["users"].insert_one(user)
        await db["users"].update_one({"_id": new_user.inserted_id}, {
                                     "$rename": {"password": "hashed_pass"}})

        created_user = await db["users"].find_one({"_id": new_user.inserted_id})
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_user)

    raise HTTPException(status_code=406, detail="User role not acceptable")

@router.get("/getId/{email}")
async def getId(email : str):
    userId = await db["users"].find_one( { "email": email } )
    return userId

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorect ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["_id"]}, expires_delta=access_token_expires
    )
    await db["users"].update_one({"_id": form_data.username}, {"$set": {
        "last_login": datetime.now().strftime("%m/%d/%y %H:%M:%S"),
        "is_active": "true"
    }})

    return {"access_token": access_token, "token_type": "bearer"}

# @router.get("/user/{email}", response_model=List[ShowUserModel])
# async def getEmail(email : str):
    

@router.get(
    "/list", response_description="List all users", response_model=List[ShowUserModel]
)
async def list_users():
    users = await db["users"].find().to_list(1000)
    for user in users:
        user["is_active"] = "false"
        try:
            last_login = datetime.strptime(user["last_login"], "%m/%d/%y %H:%M:%S")
            my_delta = datetime.now() - last_login
            if my_delta <= timedelta(days=30):
                user["is_active"] = "true"
        except ValueError:
            pass

    return users

@router.get(
    "/posts/{postN}", response_description="List all posts", response_model=List[ShowPostsModel]
)
async def list_posts(postN : int):
    posts = await db["posts"].find().sort('created_at', pymongo.DESCENDING).skip(postN).limit(postN + LIM_PAGE).to_list(LIM_PAGE)
    return posts

@router.get(
    "/comments/{postId}", response_description="List all comments", response_model=List[ShowComments]
)
async def list_comments(postId : str):
    posts = await db["comments"].find({"postId": postId}).sort('created_at', pymongo.ASCENDING).to_list(1000)
    return posts

@router.post("/addComment", response_description="Add new comment", response_model=AddComment)
async def add_post(comm: AddComment):
    datetime_now = datetime.now()
    comm.created_at = datetime_now.strftime("%m/%d/%y %H:%M:%S")
    comm = jsonable_encoder(comm)
    new_comm = await db["comments"].insert_one(comm)
    
    return JSONResponse(status_code=status.HTTP_201_CREATED)

@router.get("/current", response_description="Current User", response_model=ShowUserModel)
async def current_user(current_user: ShowUserModel = Depends(get_current_user)):
    return current_user

@router.put("/update/{user_id}", response_description="Update a user", response_model=UpdateUserModel)
async def update_user(user_id: str, user: UpdateUserModel, current_user: UserModel = Depends(get_current_user)):
    if current_user["role"] == "user":
        user = {k: v for k, v in user.dict().items() if v is not None}


        if len(user) >= 1:
            update_result = await db["users"].update_one({"_id": user_id}, {"$set": user})

            if update_result.modified_count == 1:
                if (
                    updated_user := await db["users"].find_one({"_id": user_id})
                ) is not None:
                    return updated_user

        if (existing_user := await db["users"].find_one({"_id": user_id})) is not None:
            return existing_user

        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    else:
        raise HTTPException(status_code=403, detail=f"Not having sufficient rights to modify the content")



@router.delete("/{user_id}", response_description="Delete a user")
async def delete_user(user_id: str):
    delete_result = await db["users"].delete_one({"_id": user_id})

    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"User {user_id} not found")

@router.post("/uploadFile")
async def uploadFile(file: UploadFile = File(...)):
    fileM = await db["images"].insert_one({'image': file.filename})
    print(fileM.inserted_id)
    with open(f'images/{str(fileM.inserted_id)+file.filename}', "wb") as buffer:
        print(file.file, buffer)
        shutil.copyfileobj(file.file, buffer)
        
    return str(fileM.inserted_id) + file.filename

@router.post("/addPost", response_description="Add new post", response_model=AddPost)
async def add_post(post: AddPost):
    datetime_now = datetime.now()
    post.created_at = datetime_now.strftime("%m/%d/%y %H:%M:%S")
    post = jsonable_encoder(post)
    new_post = await db["posts"].insert_one(post)
    
    return JSONResponse(status_code=status.HTTP_201_CREATED)

@router.post("/like/{postId}", response_description="Like post", response_model=LikePost)
async def like_post(LikePost: LikePost, postId: str):
    LikePost = LikePost.userId
    userId = jsonable_encoder(LikePost)
    xpost = await db["posts"].find_one({"_id": postId})
    print(1234)
    if (LikePost in xpost["likes"]):
        print(12345)
        await db["posts"].update_one({"_id":postId}, {'$pull': {'likes': userId}})
        await db["posts"].update_one({"_id":postId}, {'$inc': {'likesCnt': -1}})
    else:
        await db["posts"].update_one({"_id":postId}, {'$push': {'likes': userId}})
        await db["posts"].update_one({"_id":postId}, {'$inc': {'likesCnt': 1}})
    # ilen = db["posts"].aggregate({'len':{'$size':"$likes"}})
    # print(ilen)
    #await db["posts"].update_one({"_id":postId}, {'$push': {'likes': userId}})
    #liked_post = await db["posts"].insert_one(LikePost)
    
    return JSONResponse(status_code=status.HTTP_201_CREATED)