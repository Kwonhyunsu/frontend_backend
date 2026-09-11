from pydantic import BaseModel
from typing import Optional, List


# ==================================================
# 영화
# ==================================================

class MovieOut(BaseModel):

    id: int
    title: str
    genres: Optional[str] = None
    overview: Optional[str] = None
    year: Optional[int] = None
    poster_url: Optional[str] = None
    popularity: Optional[float] = 0

    class Config:
        from_attributes = True


class MovieCreate(BaseModel):

    title: str
    genres: Optional[str] = None
    overview: Optional[str] = None
    year: Optional[int] = None
    poster_url: Optional[str] = None
    popularity: Optional[float] = 0


class MovieUpdate(BaseModel):

    title: Optional[str] = None
    genres: Optional[str] = None
    overview: Optional[str] = None
    year: Optional[int] = None
    poster_url: Optional[str] = None
    popularity: Optional[float] = None


# ==================================================
# 사용자
# ==================================================

class UserOut(BaseModel):

    id: int
    name: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):

    name: str


class UserNameUpdate(BaseModel):

    name: str


# ==================================================
# 평점 + 리뷰 입력
# ==================================================

class RatingIn(BaseModel):

    movie_id: int
    rating: float
    review: Optional[str] = None


# ==================================================
# 평점 + 리뷰 출력
# ==================================================

class RatingOut(BaseModel):

    user_id: int
    movie_id: int
    rating: float
    review: Optional[str] = None

    class Config:
        from_attributes = True


# ==================================================
# 영화 상세 페이지 사용자 평가
# ==================================================

class MovieUserRatingOut(BaseModel):

    user_id: int
    user_name: str
    rating: float
    review: Optional[str] = None


# ==================================================
# 영화별 평점 / 리뷰 요약
# ==================================================

class MovieRatingSummaryOut(BaseModel):

    movie_id: int
    average_rating: float
    rating_count: int
    ratings: List[MovieUserRatingOut]


# ==================================================
# 추천
# ==================================================

class RecommendationOut(BaseModel):

    movie: MovieOut
    score: float