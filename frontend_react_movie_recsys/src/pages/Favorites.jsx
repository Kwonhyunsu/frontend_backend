import React, {
  useEffect,
  useState
} from 'react'

import {
  fetchFavorites,
  fetchRatings
} from '../api'

import MovieCard
  from '../components/MovieCard'

import './Favorites.css'


export default function Favorites(){

  const userId =
    sessionStorage.getItem(
      'user_id'
    )


  const [movies, setMovies] =
    useState([])


  const [ratings, setRatings] =
    useState({})


  const [loading, setLoading] =
    useState(true)


  const [error, setError] =
    useState('')


  // ================================================
  // 찜 목록 불러오기
  // ================================================

  useEffect(() => {

    async function loadFavorites(){

      try {

        setLoading(true)

        setError('')


        const [
          favoriteMovies,
          ratingData
        ] = await Promise.all([

          fetchFavorites(userId),

          fetchRatings(userId)

        ])


        setMovies(
          favoriteMovies
        )


        const ratingMap = {}


        ratingData.forEach(
          item => {

            ratingMap[
              item.movie_id
            ] = Number(
              item.rating
            )

          }
        )


        setRatings(
          ratingMap
        )


      } catch(error) {

        console.error(error)

        setError(
          '찜 목록을 불러오지 못했습니다.'
        )


      } finally {

        setLoading(false)

      }

    }


    if(userId){

      loadFavorites()

    } else {

      setLoading(false)

    }

  }, [userId])


  // ================================================
  // 평점 변경
  // ================================================

  function handleRatingChange(
    movieId,
    newRating
  ){

    setRatings(
      current => ({

        ...current,

        [movieId]:
          Number(newRating)

      })
    )

  }


  // ================================================
  // 사용자 선택 안 됨
  // ================================================

  if(!userId){

    return (

      <main className="favorites-page">

        <div className="favorites-empty">

          <h2>
            사용자를 먼저 선택해주세요.
          </h2>

          <p>
            사용자별로 서로 다른 찜 목록이 저장됩니다.
          </p>

        </div>

      </main>

    )

  }


  // ================================================
  // 로딩
  // ================================================

  if(loading){

    return (

      <p className="favorites-message">

        찜한 영화를 불러오는 중...

      </p>

    )

  }


  if(error){

    return (

      <p className="favorites-error">

        {error}

      </p>

    )

  }


  return (

    <main className="favorites-page">


      {/* ===================================== */}
      {/* 상단 */}
      {/* ===================================== */}

      <section className="favorites-header">


        <p className="favorites-small-title">

          MY FAVORITES

        </p>


        <h1>

          찜

        </h1>


        <p>

          마음에 들어 저장해둔 영화를
          한곳에서 확인할 수 있습니다.

        </p>


        <div className="favorites-count">

          총

          <strong>
            {movies.length}
          </strong>

          편

        </div>


      </section>



      {/* ===================================== */}
      {/* 아무것도 찜하지 않았을 경우 */}
      {/* ===================================== */}

      {
        movies.length === 0 ? (

          <div className="favorites-empty">


            <div className="favorites-heart">

              ♡

            </div>


            <h2>

              아직 찜한 영화가 없습니다.

            </h2>


            <p>

              영화 상세 페이지에서
              '찜' 버튼을 눌러 영화를 저장해보세요.

            </p>


          </div>

        ) : (

          <div className="favorites-grid">


            {
              movies.map(movie => (

                <MovieCard

                  key={
                    movie.id
                  }

                  movie={
                    movie
                  }

                  userId={
                    userId
                  }

                  initialRating={
                    ratings[
                      movie.id
                    ] || 0
                  }

                  onRatingChange={
                    handleRatingChange
                  }

                />

              ))
            }


          </div>

        )
      }


    </main>

  )

}