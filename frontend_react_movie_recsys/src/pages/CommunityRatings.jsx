import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  fetchUsers,
  fetchMovies,
  fetchRatings
} from '../api'

import './CommunityRatings.css'


export default function CommunityRatings(){

  const navigate =
    useNavigate()


  const currentUserId =
    sessionStorage.getItem(
      'user_id'
    )


  // ==================================================
  // 상태
  // ==================================================

  const [movies, setMovies] =
    useState([])


  const [users, setUsers] =
    useState([])


  const [allRatings, setAllRatings] =
    useState([])


  const [loading, setLoading] =
    useState(true)


  const [error, setError] =
    useState('')


  // ==================================================
  // 데이터 가져오기
  // ==================================================

  useEffect(() => {

    async function loadCommunity(){

      try {

        setLoading(true)

        setError('')


        // ------------------------------------------
        // 사용자 + 영화 목록
        // ------------------------------------------

        const [
          userData,
          movieData
        ] = await Promise.all([

          fetchUsers(),

          fetchMovies()

        ])


        setUsers(
          userData
        )


        setMovies(
          movieData
        )


        // ------------------------------------------
        // 모든 사용자 평점 + 리뷰 가져오기
        // ------------------------------------------

        const ratingGroups =
          await Promise.all(

            userData.map(
              async user => {

                const ratings =
                  await fetchRatings(
                    user.id
                  )


                return ratings.map(
                  item => ({

                    userId:
                      user.id,

                    userName:
                      user.name,

                    movieId:
                      item.movie_id,

                    rating:
                      Number(
                        item.rating
                      ),

                    review:
                      item.review
                      || ''

                  })
                )

              }
            )

          )


        setAllRatings(
          ratingGroups.flat()
        )


      } catch(error) {

        console.error(error)


        setError(
          '커뮤니티 평가 정보를 불러오지 못했습니다.'
        )


      } finally {

        setLoading(false)

      }

    }


    loadCommunity()

  }, [])


  // ==================================================
  // 영화별 평가 묶기
  // ==================================================

  const communityMovies =
    useMemo(() => {

      // ------------------------------------------
      // 영화 ID → 영화 정보
      // ------------------------------------------

      const movieMap = {}


      movies.forEach(
        movie => {

          movieMap[
            movie.id
          ] = movie

        }
      )


      // ------------------------------------------
      // 영화별 평점 그룹
      // ------------------------------------------

      const grouped = {}


      allRatings.forEach(
        item => {

          if(
            !grouped[
              item.movieId
            ]
          ){

            grouped[
              item.movieId
            ] = []

          }


          grouped[
            item.movieId
          ].push(
            item
          )

        }
      )


      // ------------------------------------------
      // 화면용 데이터 만들기
      // ------------------------------------------

      const result =
        Object.entries(
          grouped
        )
        .map(
          ([
            movieId,
            ratings
          ]) => {

            const movie =
              movieMap[
                Number(movieId)
              ]


            if(!movie){

              return null

            }


            const total =
              ratings.reduce(
                (
                  sum,
                  item
                ) =>

                  sum
                  + Number(
                      item.rating
                    ),

                0
              )


            const average =
              ratings.length > 0

                ? total
                  / ratings.length

                : 0


            const reviewCount =
              ratings.filter(
                item =>
                  item.review
                  && item.review.trim()
              ).length


            // 내 평가를 위쪽으로,
            // 그 다음 높은 평점 순
            const sortedRatings = [

              ...ratings

            ].sort(
              (a, b) => {

                const aIsMine =
                  Number(
                    a.userId
                  )
                  === Number(
                    currentUserId
                  )


                const bIsMine =
                  Number(
                    b.userId
                  )
                  === Number(
                    currentUserId
                  )


                if(
                  aIsMine
                  && !bIsMine
                ){

                  return -1

                }


                if(
                  !aIsMine
                  && bIsMine
                ){

                  return 1

                }


                return (
                  Number(
                    b.rating
                  )
                  -
                  Number(
                    a.rating
                  )
                )

              }
            )


            return {

              movie,

              average,

              ratingCount:
                ratings.length,

              reviewCount,

              ratings:
                sortedRatings

            }

          }
        )
        .filter(Boolean)


      // 평균 평점 높은 영화 먼저
      result.sort(
        (a, b) => {

          if(
            b.average
            !== a.average
          ){

            return (
              b.average
              - a.average
            )

          }


          return (
            b.ratingCount
            - a.ratingCount
          )

        }
      )


      return result

    }, [
      movies,
      allRatings,
      currentUserId
    ])


  // ==================================================
  // 전체 통계
  // ==================================================

  const totalReviewCount =
    useMemo(() => {

      return (
        allRatings.filter(
          item =>
            item.review
            && item.review.trim()
        ).length
      )

    }, [allRatings])


  // ==================================================
  // 로딩
  // ==================================================

  if(loading){

    return (

      <p className="community-message">

        커뮤니티 평가를 불러오는 중...

      </p>

    )

  }


  // ==================================================
  // 오류
  // ==================================================

  if(error){

    return (

      <p className="community-error">

        {error}

      </p>

    )

  }


  return (

    <main className="community-page">


      {/* ===================================== */}
      {/* 페이지 상단 */}
      {/* ===================================== */}

      <section className="community-header">


        <p className="community-small-title">

          COMMUNITY

        </p>


        <h1>

          영화 커뮤니티

        </h1>


        <p>

          다른 이용자들이 남긴
          영화 평점과 한줄평을 확인해보세요.

        </p>



        {/* 통계 */}

        <div className="community-summary">


          <div>

            <span>
              평가
            </span>

            <strong>
              {allRatings.length}
            </strong>

          </div>


          <div>

            <span>
              리뷰
            </span>

            <strong>
              {totalReviewCount}
            </strong>

          </div>


          <div>

            <span>
              평가된 영화
            </span>

            <strong>
              {communityMovies.length}
            </strong>

          </div>


          <div>

            <span>
              사용자
            </span>

            <strong>
              {users.length}
            </strong>

          </div>


        </div>


      </section>



      {/* ===================================== */}
      {/* 평가가 없을 경우 */}
      {/* ===================================== */}

      {
        communityMovies.length
        === 0 ? (

          <div className="community-empty">


            <h2>

              아직 등록된 평가가 없습니다.

            </h2>


            <p>

              영화를 평가하면
              이곳에서 다른 사용자들과
              평가를 공유할 수 있습니다.

            </p>


          </div>

        ) : (

          <div className="community-movie-list">


            {
              communityMovies.map(
                item => (

                  <section

                    key={
                      item.movie.id
                    }

                    className="community-movie-card"

                  >


                    {/* ========================= */}
                    {/* 영화 정보 */}
                    {/* ========================= */}

                    <div className="community-movie-info">


                      {/* 포스터 */}

                      <div

                        className="community-poster-area"

                        onClick={() =>
                          navigate(
                            `/movies/${item.movie.id}`
                          )
                        }

                      >


                        {
                          item.movie.poster_url ? (

                            <img

                              src={
                                item.movie.poster_url
                              }

                              alt={
                                item.movie.title
                              }

                              className="community-poster"

                            />

                          ) : (

                            <div className="community-no-poster">

                              포스터 없음

                            </div>

                          )
                        }


                      </div>



                      {/* 영화 기본 정보 */}

                      <div className="community-movie-main">


                        <p className="community-movie-id">

                          MOVIE #{item.movie.id}

                        </p>


                        <h2

                          onClick={() =>
                            navigate(
                              `/movies/${item.movie.id}`
                            )
                          }

                        >

                          {
                            item.movie.title
                          }

                        </h2>


                        <p className="community-meta">

                          {
                            item.movie.genres
                            || '장르 정보 없음'
                          }


                          {
                            item.movie.year
                              ? ` · ${item.movie.year}`
                              : ''
                          }

                        </p>


                        {
                          item.movie.overview && (

                            <p className="community-overview">

                              {
                                item.movie.overview
                              }

                            </p>

                          )
                        }


                      </div>



                      {/* 평균 */}

                      <div className="community-average">


                        <span className="average-star">

                          ★

                        </span>


                        <strong>

                          {
                            item.average.toFixed(
                              1
                            )
                          }

                        </strong>


                        <span>

                          / 5

                        </span>


                        <small className="rating-count">

                          {
                            item.ratingCount
                          }명 평가

                        </small>


                        <small className="review-count">

                          {
                            item.reviewCount
                          }개 리뷰

                        </small>


                      </div>


                    </div>



                    {/* ========================= */}
                    {/* 사용자 평가 */}
                    {/* ========================= */}

                    <div className="community-user-ratings">


                      {
                        item.ratings.map(
                          userRating => {


                            const isMine =
                              Number(
                                userRating.userId
                              )
                              === Number(
                                currentUserId
                              )


                            return (

                              <article

                                key={
                                  `${item.movie.id}-${userRating.userId}`
                                }

                                className={
                                  isMine

                                    ? 'community-user-row my-rating'

                                    : 'community-user-row'
                                }

                              >


                                {/* ================= */}
                                {/* 사용자 */}
                                {/* ================= */}

                                <div className="community-user-info">


                                  <div className="community-user-icon">

                                    👤

                                  </div>


                                  <div className="community-user-name-area">


                                    <div className="community-user-name-line">


                                      <strong>

                                        {
                                          userRating.userName
                                        }

                                      </strong>


                                      {
                                        isMine && (

                                          <span className="me-badge">

                                            내 평가

                                          </span>

                                        )
                                      }


                                    </div>


                                    <span className="community-user-id">

                                      USER #{userRating.userId}

                                    </span>


                                  </div>


                                </div>



                                {/* ================= */}
                                {/* 평점 + 리뷰 */}
                                {/* ================= */}

                                <div className="community-evaluation-content">


                                  {/* 별점 */}

                                  <div className="community-score-row">


                                    <div className="community-half-stars">


                                      {[0,1,2,3,4].map(
                                        index => {


                                          const fill =
                                            Math.max(
                                              0,
                                              Math.min(
                                                1,
                                                Number(
                                                  userRating.rating
                                                )
                                                - index
                                              )
                                            )


                                          return (

                                            <span

                                              key={index}

                                              className="community-half-star"

                                            >


                                              <span className="community-star-base">

                                                ★

                                              </span>


                                              <span

                                                className="community-star-fill"

                                                style={{
                                                  width:
                                                    `${fill * 100}%`
                                                }}

                                              >

                                                <span className="community-star-symbol">

                                                  ★

                                                </span>


                                              </span>


                                            </span>

                                          )

                                        }
                                      )}


                                    </div>


                                    <strong className="community-score-number">

                                      {
                                        Number(
                                          userRating.rating
                                        ).toFixed(1)
                                      }

                                      <span>
                                        점
                                      </span>


                                    </strong>


                                  </div>



                                  {/* 리뷰 */}

                                  {
                                    userRating.review
                                    && userRating.review.trim() ? (

                                      <p className="community-review-text">

                                        “{
                                          userRating.review
                                        }”

                                      </p>

                                    ) : (

                                      <p className="community-review-text no-review">

                                        작성한 한줄평이 없습니다.

                                      </p>

                                    )
                                  }


                                </div>


                              </article>

                            )

                          }
                        )
                      }


                    </div>


                  </section>

                )
              )
            }


          </div>

        )
      }


    </main>

  )

}