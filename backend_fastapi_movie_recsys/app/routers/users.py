from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from typing import List


from ..db import get_db

from ..models import (
    User,
    Movie,
    Rating,
    Favorite
)

from ..schemas import (
    UserOut,
    UserCreate,
    UserNameUpdate,
    RatingIn,
    RatingOut,
    MovieOut
)


router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)


# ==================================================
# 사용자 전체 조회
# ==================================================

@router.get(
    "",
    response_model=List[UserOut]
)
def list_users(
    db: Session = Depends(get_db)
):

    return db.query(User).all()


# ==================================================
# 사용자 추가
# ==================================================

@router.post(
    "",
    response_model=UserOut
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db)
):

    name = payload.name.strip()


    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )


    if len(name) > 100:

        raise HTTPException(
            status_code=400,
            detail="Name is too long"
        )


    user = User(
        name=name
    )


    db.add(user)

    db.commit()

    db.refresh(user)


    return user


# ==================================================
# 사용자 이름 수정
# ==================================================

@router.patch(
    "/{user_id}",
    response_model=UserOut
)
def update_user_name(
    user_id: int,
    payload: UserNameUpdate,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    name = payload.name.strip()


    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )


    if len(name) > 100:

        raise HTTPException(
            status_code=400,
            detail="Name is too long"
        )


    user.name = name


    db.commit()

    db.refresh(user)


    return user


# ==================================================
# 사용자 삭제
# ==================================================

@router.delete(
    "/{user_id}"
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    db.query(Rating).filter(
        Rating.user_id == user_id
    ).delete(
        synchronize_session=False
    )


    db.query(Favorite).filter(
        Favorite.user_id == user_id
    ).delete(
        synchronize_session=False
    )


    db.delete(user)

    db.commit()


    return {
        "success": True,
        "message": "User deleted"
    }


# ==================================================
# 사용자 평점 + 리뷰 조회
# ==================================================

@router.get(
    "/{user_id}/ratings",
    response_model=List[RatingOut]
)
def get_ratings(
    user_id: int,
    db: Session = Depends(get_db)
):

    return (
        db.query(Rating)
        .filter(
            Rating.user_id == user_id
        )
        .all()
    )


# ==================================================
# 평점 + 리뷰 등록 / 수정
# ==================================================

@router.post(
    "/{user_id}/ratings",
    response_model=RatingOut
)
def upsert_rating(
    user_id: int,
    payload: RatingIn,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


    movie = (
        db.query(Movie)
        .filter(
            Movie.id == payload.movie_id
        )
        .first()
    )


    if not user or not movie:

        raise HTTPException(
            status_code=404,
            detail="User or movie not found"
        )


    if (
        payload.rating < 0
        or payload.rating > 5
    ):

        raise HTTPException(
            status_code=400,
            detail="Rating must be between 0 and 5"
        )


    # ------------------------------------------------
    # review가 요청에 실제로 포함되었는지 확인
    # ------------------------------------------------

    fields_set = getattr(
        payload,
        "model_fields_set",
        getattr(
            payload,
            "__fields_set__",
            set()
        )
    )


    review_supplied = (
        "review" in fields_set
    )


    clean_review = None


    if review_supplied:

        if payload.review:

            clean_review = (
                payload.review.strip()
            )


            if len(clean_review) > 500:

                raise HTTPException(
                    status_code=400,
                    detail="Review must be 500 characters or less"
                )


            if not clean_review:

                clean_review = None


    # ------------------------------------------------
    # 기존 평가 확인
    # ------------------------------------------------

    rating = (
        db.query(Rating)
        .filter(
            Rating.user_id == user_id,
            Rating.movie_id == payload.movie_id
        )
        .one_or_none()
    )


    # ------------------------------------------------
    # 기존 평가 수정
    # ------------------------------------------------

    if rating:

        rating.rating = (
            payload.rating
        )


        # 리뷰를 요청했을 때만 변경
        if review_supplied:

            rating.review = (
                clean_review
            )


    # ------------------------------------------------
    # 새로운 평가
    # ------------------------------------------------

    else:

        rating = Rating(

            user_id=user_id,

            movie_id=payload.movie_id,

            rating=payload.rating,

            review=(
                clean_review
                if review_supplied
                else None
            )

        )


        db.add(rating)


    db.commit()

    db.refresh(rating)


    return rating


# ==================================================
# 평점 + 리뷰 삭제
# ==================================================

@router.delete(
    "/{user_id}/ratings/{movie_id}"
)
def delete_rating(
    user_id: int,
    movie_id: int,
    db: Session = Depends(get_db)
):

    rating = (
        db.query(Rating)
        .filter(
            Rating.user_id == user_id,
            Rating.movie_id == movie_id
        )
        .one_or_none()
    )


    if not rating:

        raise HTTPException(
            status_code=404,
            detail="Rating not found"
        )


    db.delete(rating)

    db.commit()


    return {
        "success": True,
        "message": "Rating deleted"
    }


# ==================================================
# 찜 목록
# ==================================================

@router.get(
    "/{user_id}/favorites",
    response_model=List[MovieOut]
)
def get_favorites(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    return (
        db.query(Movie)
        .join(
            Favorite,
            Favorite.movie_id == Movie.id
        )
        .filter(
            Favorite.user_id == user_id
        )
        .order_by(
            Movie.id.desc()
        )
        .all()
    )


# ==================================================
# 찜
# ==================================================

@router.post(
    "/{user_id}/favorites/{movie_id}"
)
def add_favorite(
    user_id: int,
    movie_id: int,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


    movie = (
        db.query(Movie)
        .filter(
            Movie.id == movie_id
        )
        .first()
    )


    if not user or not movie:

        raise HTTPException(
            status_code=404,
            detail="User or movie not found"
        )


    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user_id,
            Favorite.movie_id == movie_id
        )
        .one_or_none()
    )


    if favorite:

        return {
            "success": True,
            "favorited": True
        }


    favorite = Favorite(

        user_id=user_id,

        movie_id=movie_id

    )


    db.add(favorite)

    db.commit()


    return {
        "success": True,
        "favorited": True
    }


# ==================================================
# 찜 해제
# ==================================================

@router.delete(
    "/{user_id}/favorites/{movie_id}"
)
def delete_favorite(
    user_id: int,
    movie_id: int,
    db: Session = Depends(get_db)
):

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user_id,
            Favorite.movie_id == movie_id
        )
        .one_or_none()
    )


    if not favorite:

        return {
            "success": True,
            "favorited": False
        }


    db.delete(favorite)

    db.commit()


    return {
        "success": True,
        "favorited": False
    }