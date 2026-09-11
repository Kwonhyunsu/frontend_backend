from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    ForeignKey
)

from sqlalchemy.orm import relationship

from .db import Base


# ==================================================
# 영화
# ==================================================

class Movie(Base):

    __tablename__ = "movies"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    genres = Column(
        String(255),
        nullable=True
    )

    overview = Column(
        Text,
        nullable=True
    )

    year = Column(
        Integer,
        nullable=True
    )

    poster_url = Column(
        String(500),
        nullable=True
    )

    popularity = Column(
        Float,
        default=0.0
    )


    ratings = relationship(
        "Rating",
        back_populates="movie",
        cascade="all, delete-orphan"
    )


    favorites = relationship(
        "Favorite",
        back_populates="movie",
        cascade="all, delete-orphan"
    )


# ==================================================
# 사용자
# ==================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )


    ratings = relationship(
        "Rating",
        back_populates="user",
        cascade="all, delete-orphan"
    )


    favorites = relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# ==================================================
# 평점 + 리뷰
# ==================================================

class Rating(Base):

    __tablename__ = "ratings"


    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )


    movie_id = Column(
        Integer,
        ForeignKey(
            "movies.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )


    rating = Column(
        Float,
        nullable=False
    )


    review = Column(
        String(500),
        nullable=True
    )


    user = relationship(
        "User",
        back_populates="ratings"
    )


    movie = relationship(
        "Movie",
        back_populates="ratings"
    )


# ==================================================
# 찜
# ==================================================

class Favorite(Base):

    __tablename__ = "favorites"


    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )


    movie_id = Column(
        Integer,
        ForeignKey(
            "movies.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )


    user = relationship(
        "User",
        back_populates="favorites"
    )


    movie = relationship(
        "Movie",
        back_populates="favorites"
    )