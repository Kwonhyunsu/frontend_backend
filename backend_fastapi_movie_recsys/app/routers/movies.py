from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from typing import List


from ..db import get_db

from ..models import (
    Movie,
    Rating,
    User
)

from ..schemas import (
    MovieOut,
    MovieCreate,
    MovieUpdate,
    MovieRatingSummaryOut
)


router = APIRouter(
    prefix="/api/movies",
    tags=["movies"]
)


# ==================================================
# 영화 전체
# ==================================================

@router.get(
    "",
    response_model=List[MovieOut]
)
def list_movies(
    limit: int = 100,
    db: Session = Depends(get_db)
):

    return (
        db.query(Movie)
        .limit(limit)
        .all()
    )


# ==================================================
# 영화 하나
# ==================================================

@router.get(
    "/{movie_id}",
    response_model=MovieOut
)
def get_movie(
    movie_id: int,
    db: Session = Depends(get_db)
):

    movie = (
        db.query(Movie)
        .filter(
            Movie.id == movie_id
        )
        .first()
    )


    if not movie:

        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )


    return movie


# ==================================================
# 영화 추가
# ==================================================

@router.post(
    "",
    response_model=MovieOut
)
def create_movie(
    payload: MovieCreate,
    db: Session = Depends(get_db)
):

    title = (
        payload.title.strip()
    )


    if not title:

        raise HTTPException(
            status_code=400,
            detail="Movie title cannot be empty"
        )


    movie = Movie(

        title=title,

        genres=payload.genres,

        overview=payload.overview,

        year=payload.year,

        poster_url=payload.poster_url,

        popularity=(
            payload.popularity
            or 0
        )

    )


    db.add(movie)

    db.commit()

    db.refresh(movie)


    return movie


# ==================================================
# 영화 수정
# ==================================================

@router.patch(
    "/{movie_id}",
    response_model=MovieOut
)
def update_movie(
    movie_id: int,
    payload: MovieUpdate,
    db: Session = Depends(get_db)
):

    movie = (
        db.query(Movie)
        .filter(
            Movie.id == movie_id
        )
        .first()
    )


    if not movie:

        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )


    if payload.title is not None:

        title = (
            payload.title.strip()
        )


        if not title:

            raise HTTPException(
                status_code=400,
                detail="Movie title cannot be empty"
            )


        movie.title = title


    if payload.genres is not None:

        movie.genres = (
            payload.genres
        )


    if payload.overview is not None:

        movie.overview = (
            payload.overview
        )


    if payload.year is not None:

        movie.year = (
            payload.year
        )


    if payload.poster_url is not None:

        movie.poster_url = (
            payload.poster_url
        )


    if payload.popularity is not None:

        movie.popularity = (
            payload.popularity
        )


    db.commit()

    db.refresh(movie)


    return movie


# ==================================================
# 영화 삭제
# ==================================================

@router.delete(
    "/{movie_id}"
)
def delete_movie(
    movie_id: int,
    db: Session = Depends(get_db)
):

    movie = (
        db.query(Movie)
        .filter(
            Movie.id == movie_id
        )
        .first()
    )


    if not movie:

        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )


    db.query(Rating).filter(

        Rating.movie_id
        == movie_id

    ).delete(
        synchronize_session=False
    )


    db.delete(movie)

    db.commit()


    return {
        "success": True,
        "message": "Movie deleted"
    }


# ==================================================
# 영화별 평가
#
# 평균평점
# 평가 수
# 사용자
# 평점
# 리뷰
# ==================================================

@router.get(
    "/{movie_id}/ratings",
    response_model=MovieRatingSummaryOut
)
def get_movie_ratings(
    movie_id: int,
    db: Session = Depends(get_db)
):

    movie = (
        db.query(Movie)
        .filter(
            Movie.id == movie_id
        )
        .first()
    )


    if not movie:

        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )


    rows = (
        db.query(
            Rating,
            User
        )
        .join(
            User,
            Rating.user_id
            == User.id
        )
        .filter(
            Rating.movie_id
            == movie_id
        )
        .all()
    )


    ratings = []


    for rating, user in rows:

        ratings.append({

            "user_id":
                user.id,

            "user_name":
                user.name,

            "rating":
                float(
                    rating.rating
                ),

            "review":
                rating.review

        })


    rating_count = (
        len(ratings)
    )


    if rating_count > 0:

        average_rating = (

            sum(
                item["rating"]
                for item in ratings
            )

            / rating_count

        )


    else:

        average_rating = 0


    return {

        "movie_id":
            movie_id,

        "average_rating":
            average_rating,

        "rating_count":
            rating_count,

        "ratings":
            ratings

    }