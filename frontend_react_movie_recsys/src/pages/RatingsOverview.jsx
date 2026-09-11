import React, { useEffect, useState } from 'react'

import {
  fetchUsers,
  fetchMovies,
  fetchRatings
} from '../api'

import './RatingsOverview.css'


export default function RatingsOverview(){

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(()=>{

    async function loadRatings(){

      try {

        setLoading(true)
        setError('')


        // 사용자와 영화 목록 동시에 조회
        const [users, movies] =
          await Promise.all([
            fetchUsers(),
            fetchMovies()
          ])


        // 영화 ID로 빠르게 찾기 위한 객체
        const movieMap = {}

        movies.forEach(movie => {

          movieMap[movie.id] = movie

        })


        // 모든 사용자의 평점 조회
        const ratingGroups =
          await Promise.all(

            users.map(async user => {

              const ratings =
                await fetchRatings(user.id)


              return ratings.map(rating => {

                const movie =
                  movieMap[rating.movie_id]


                return {

                  userId: user.id,

                  userName: user.name,

                  movieId: rating.movie_id,

                  movieTitle:
                    movie
                      ? movie.title
                      : `영화 #${rating.movie_id}`,

                  rating:
                    Number(rating.rating)

                }

              })

            })

          )


        const allRows =
          ratingGroups.flat()


        // 사용자 번호 → 영화 번호 순서 정렬
        allRows.sort((a, b) => {

          if(a.userId !== b.userId){

            return a.userId - b.userId

          }

          return a.movieId - b.movieId

        })


        setRows(allRows)


      } catch(error) {

        console.error(error)

        setError(
          '평점 정보를 불러오지 못했습니다.'
        )


      } finally {

        setLoading(false)

      }

    }


    loadRatings()

  }, [])



  // 로딩
  if(loading){

    return (

      <p className="ratings-message">

        ⭐ 평점 정보를 불러오는 중...

      </p>

    )

  }


  // 오류
  if(error){

    return (

      <p className="ratings-error">

        {error}

      </p>

    )

  }


  return (

    <main className="ratings-page">


      {/* ====================================== */}
      {/* 상단 제목 */}
      {/* ====================================== */}

      <section className="ratings-header">

        <p className="ratings-small-title">
          전체 평점 현황
        </p>

        <h1>
          ⭐ 사용자 영화 평점
        </h1>

        <p className="ratings-description">
          각 사용자가 어떤 영화에 몇 점을 남겼는지 확인할 수 있습니다.
        </p>

      </section>



      {/* ====================================== */}
      {/* 평점 테이블 */}
      {/* ====================================== */}

      <section className="ratings-table">


        {/* 헤더 */}

        <div className="ratings-table-header">

          <div>
            사용자
          </div>

          <div>
            영화
          </div>

          <div>
            평점
          </div>

        </div>



        {/* 데이터가 없을 경우 */}

        {
          rows.length === 0 && (

            <div className="ratings-empty">

              등록된 평점이 없습니다.

            </div>

          )
        }



        {/* ==================================== */}
        {/* 평점 데이터 */}
        {/* ==================================== */}

        {
          rows.map(row => (

            <div
              key={`${row.userId}-${row.movieId}`}
              className="ratings-table-row"
            >


              {/* ============================== */}
              {/* 사용자 */}
              {/* ============================== */}

              <div className="ratings-user-cell">


                <div className="ratings-user-icon">

                  👤

                </div>


                <div className="ratings-user-text">

                  <strong>
                    {row.userName}
                  </strong>

                  <span>
                    USER #{row.userId}
                  </span>

                </div>


              </div>



              {/* ============================== */}
              {/* 영화 */}
              {/* ============================== */}

              <div className="ratings-movie-cell">


                <strong>
                  {row.movieTitle}
                </strong>

                <span>
                  MOVIE #{row.movieId}
                </span>


              </div>



              {/* ============================== */}
              {/* 평점 */}
              {/* ============================== */}

              <div className="ratings-score-cell">


                {/* 별 5개 */}

                <div className="fraction-star-list">


                  {[0, 1, 2, 3, 4].map(index => {


                    /*
                      예: 4.5점

                      index 0 = 100%
                      index 1 = 100%
                      index 2 = 100%
                      index 3 = 100%
                      index 4 = 50%
                    */

                    const fill =
                      Math.max(
                        0,
                        Math.min(
                          1,
                          row.rating - index
                        )
                      )


                    return (

                      <span
                        key={index}
                        className="fraction-star"
                      >


                        {/* 빈 회색 별 */}

                        <span className="fraction-star-base">
                          ★
                        </span>


                        {/* 평점만큼 채워지는 노란 별 */}

                        <span
                          className="fraction-star-fill"
                          style={{
                            width: `${fill * 100}%`
                          }}
                        >

                          <span className="fraction-star-symbol">
                            ★
                          </span>

                        </span>


                      </span>

                    )

                  })}


                </div>



                {/* 숫자 평점 */}

                <strong className="ratings-score-number">

                  {row.rating.toFixed(1)} / 5

                </strong>


              </div>


            </div>

          ))
        }


      </section>


    </main>

  )

}