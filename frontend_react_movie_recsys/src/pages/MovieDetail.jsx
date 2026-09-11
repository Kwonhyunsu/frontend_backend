import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  useNavigate,
  useParams
} from 'react-router-dom'

import {
  fetchMovie,
  fetchMovieRatingSummary,
  saveRating,
  deleteRating,
  fetchFavorites,
  addFavorite,
  removeFavorite
} from '../api'

import './MovieDetail.css'


export default function MovieDetail(){

  const {
    movieId
  } = useParams()


  const navigate =
    useNavigate()


  const userId =
    sessionStorage.getItem(
      'user_id'
    )


  // ==================================================
  // 영화 데이터
  // ==================================================

  const [movie, setMovie] =
    useState(null)


  const [summary, setSummary] =
    useState(null)


  // ==================================================
  // 내 평가
  // ==================================================

  const [rating, setRating] =
    useState(0)


  const [savedRating, setSavedRating] =
    useState(0)


  const [review, setReview] =
    useState('')


  const [savedReview, setSavedReview] =
    useState('')


  // ==================================================
  // 찜
  // ==================================================

  const [
    isFavorite,
    setIsFavorite
  ] = useState(false)


  const [
    favoriteLoading,
    setFavoriteLoading
  ] = useState(false)


  // ==================================================
  // 상태
  // ==================================================

  const [loading, setLoading] =
    useState(true)


  const [saving, setSaving] =
    useState(false)


  const [deleting, setDeleting] =
    useState(false)


  const [error, setError] =
    useState('')


  const [message, setMessage] =
    useState('')


  // ==================================================
  // 상세 정보
  // ==================================================

  useEffect(() => {

    loadDetail()

  }, [
    movieId,
    userId
  ])


  async function loadDetail(){

    try {

      setLoading(true)

      setError('')


      const [
        movieData,
        summaryData
      ] = await Promise.all([

        fetchMovie(
          movieId
        ),

        fetchMovieRatingSummary(
          movieId
        )

      ])


      setMovie(
        movieData
      )


      setSummary(
        summaryData
      )


      // ============================================
      // 현재 사용자의 기존 평가 찾기
      // ============================================

      if(userId){

        const myEvaluation =
          summaryData.ratings.find(
            item =>

              Number(
                item.user_id
              )

              ===

              Number(
                userId
              )
          )


        if(myEvaluation){

          const value =
            Number(
              myEvaluation.rating
            )


          setRating(value)

          setSavedRating(value)


          setReview(
            myEvaluation.review
            || ''
          )


          setSavedReview(
            myEvaluation.review
            || ''
          )

        } else {

          setRating(0)

          setSavedRating(0)

          setReview('')

          setSavedReview('')

        }


        // ==========================================
        // 찜
        // ==========================================

        const favoriteMovies =
          await fetchFavorites(
            userId
          )


        const favorite =
          favoriteMovies.some(
            item =>

              Number(item.id)
              === Number(movieId)
          )


        setIsFavorite(
          favorite
        )

      }


    } catch(error) {

      console.error(error)


      setError(
        '영화 상세 정보를 불러오지 못했습니다.'
      )


    } finally {

      setLoading(false)

    }

  }


  // ==================================================
  // 다른 이용자 평가
  // ==================================================

  const otherRatings =
    useMemo(() => {

      if(
        !summary
        || !summary.ratings
      ){

        return []

      }


      return (
        summary.ratings.filter(
          item =>

            Number(
              item.user_id
            )

            !==

            Number(
              userId
            )
        )
      )

    }, [
      summary,
      userId
    ])


  // ==================================================
  // 평점 다시 조회
  // ==================================================

  async function refreshSummary(){

    const data =
      await fetchMovieRatingSummary(
        movieId
      )


    setSummary(data)


    return data

  }


  // ==================================================
  // 별 선택
  // ==================================================

  function selectRating(
    value
  ){

    setRating(
      value
    )

    setMessage('')

  }


  // ==================================================
  // 평점 + 리뷰 저장
  // ==================================================

  async function submitEvaluation(){

    if(!userId){

      alert(
        '먼저 사용자를 선택해주세요.'
      )

      return

    }


    if(rating === 0){

      alert(
        '별점을 먼저 선택해주세요.'
      )

      return

    }


    if(
      review.length > 500
    ){

      alert(
        '한줄평은 500자 이하로 작성해주세요.'
      )

      return

    }


    try {

      setSaving(true)

      setMessage('')


      const result =
        await saveRating(

          userId,

          movieId,

          rating,

          review

        )


      const value =
        Number(
          result.rating
        )


      setRating(value)

      setSavedRating(value)


      const newReview =
        result.review || ''


      setReview(
        newReview
      )

      setSavedReview(
        newReview
      )


      await refreshSummary()


      setMessage(
        '평점과 리뷰가 저장되었습니다.'
      )


    } catch(error) {

      console.error(error)


      setMessage(
        '평점과 리뷰 저장에 실패했습니다.'
      )


    } finally {

      setSaving(false)

    }

  }


  // ==================================================
  // 평가 전체 삭제
  //
  // 평점 + 리뷰 둘 다 삭제
  // ==================================================

  async function removeEvaluation(){

    if(
      savedRating === 0
    ){

      return

    }


    const confirmed =
      window.confirm(

        `'${movie.title}'에 남긴 평점과 리뷰를 삭제하시겠습니까?`

      )


    if(!confirmed){

      return

    }


    try {

      setDeleting(true)

      setMessage('')


      await deleteRating(
        userId,
        movieId
      )


      setRating(0)

      setSavedRating(0)

      setReview('')

      setSavedReview('')


      await refreshSummary()


      setMessage(
        '평점과 리뷰가 삭제되었습니다.'
      )


    } catch(error) {

      console.error(error)


      setMessage(
        '평가 삭제에 실패했습니다.'
      )


    } finally {

      setDeleting(false)

    }

  }


  // ==================================================
  // 찜
  // ==================================================

  async function toggleFavorite(){

    if(!userId){

      alert(
        '먼저 사용자를 선택해주세요.'
      )

      return

    }


    try {

      setFavoriteLoading(true)


      if(isFavorite){

        await removeFavorite(
          userId,
          movieId
        )


        setIsFavorite(
          false
        )

      } else {

        await addFavorite(
          userId,
          movieId
        )


        setIsFavorite(
          true
        )

      }


    } catch(error) {

      console.error(error)


      alert(
        '찜 상태 변경에 실패했습니다.'
      )


    } finally {

      setFavoriteLoading(false)

    }

  }


  // ==================================================
  // 로딩
  // ==================================================

  if(loading){

    return (

      <p className="movie-detail-message">

        영화 상세 정보를 불러오는 중...

      </p>

    )

  }


  if(
    error
    || !movie
  ){

    return (

      <p className="movie-detail-error">

        {
          error
          || '영화를 찾을 수 없습니다.'
        }

      </p>

    )

  }


  return (

    <main className="movie-detail-page">


      {/* ===================================== */}
      {/* 뒤로 */}
      {/* ===================================== */}

      <button

        type="button"

        className="movie-detail-back"

        onClick={() =>
          navigate(-1)
        }

      >

        ← 이전 화면

      </button>



      {/* ===================================== */}
      {/* 영화 정보 */}
      {/* ===================================== */}

      <section className="movie-detail-hero">


        <div className="movie-detail-poster-area">


          {
            movie.poster_url ? (

              <img

                src={
                  movie.poster_url
                }

                alt={
                  movie.title
                }

                className="movie-detail-poster"

              />

            ) : (

              <div className="movie-detail-no-poster">

                포스터 없음

              </div>

            )
          }


        </div>



        <div className="movie-detail-main">


          <p className="movie-detail-small-title">

            영화 상세 정보

          </p>



          <div className="movie-detail-title-row">


            <h1>

              {movie.title}

            </h1>


            <button

              type="button"

              className={
                isFavorite

                  ? 'favorite-button active'

                  : 'favorite-button'
              }

              disabled={
                favoriteLoading
              }

              onClick={
                toggleFavorite
              }

            >

              {
                favoriteLoading

                  ? '처리 중...'

                  : isFavorite

                    ? '♥ 찜됨'

                    : '♡ 찜'
              }

            </button>


          </div>



          <div className="movie-detail-meta">


            {
              movie.year && (

                <span>
                  {movie.year}
                </span>

              )
            }


            {
              movie.genres && (

                <span>
                  {movie.genres}
                </span>

              )
            }


            <span>

              MOVIE #{movie.id}

            </span>


          </div>



          <div className="movie-detail-average">


            <span className="detail-average-star">

              ★

            </span>


            <strong>

              {
                summary

                  ? Number(
                      summary.average_rating
                    ).toFixed(1)

                  : '0.0'
              }

            </strong>


            <span>
              / 5
            </span>


            <small>

              {
                summary
                  ? `${summary.rating_count}명 평가`
                  : '0명 평가'
              }

            </small>


          </div>



          <div className="movie-detail-overview">


            <h2>

              줄거리

            </h2>


            <p>

              {
                movie.overview
                || '등록된 줄거리가 없습니다.'
              }

            </p>


          </div>


        </div>


      </section>



      {/* ===================================== */}
      {/* 내 평가 */}
      {/* ===================================== */}

      <section className="movie-detail-section">


        <div className="movie-detail-section-title">


          <div>

            <p>
              MY REVIEW
            </p>

            <h2>
              내 평가
            </h2>

          </div>


          {
            savedRating > 0 && (

              <span className="my-rating-badge">

                현재 {savedRating.toFixed(1)}점

              </span>

            )
          }


        </div>



        {
          userId ? (

            <div className="detail-evaluation-box">


              {/* 별점 */}

              <div className="detail-rating-top">


                <div className="detail-half-star-rating">


                  {[0,1,2,3,4].map(
                    index => {


                      const fill =
                        Math.max(
                          0,
                          Math.min(
                            1,
                            rating - index
                          )
                        )


                      return (

                        <div

                          key={index}

                          className="detail-half-star-item"

                        >


                          <span className="detail-star-base">

                            ★

                          </span>


                          <span

                            className="detail-star-fill"

                            style={{
                              width:
                                `${fill * 100}%`
                            }}

                          >

                            ★

                          </span>


                          <button

                            type="button"

                            className="detail-star-click left"

                            onClick={() =>
                              selectRating(
                                index + 0.5
                              )
                            }

                          />


                          <button

                            type="button"

                            className="detail-star-click right"

                            onClick={() =>
                              selectRating(
                                index + 1
                              )
                            }

                          />


                        </div>

                      )

                    }
                  )}


                </div>


                <strong className="detail-rating-number">

                  {
                    rating > 0

                      ? `${rating.toFixed(1)} / 5`

                      : '평점을 선택해주세요.'
                  }

                </strong>


              </div>



              {/* 리뷰 */}

              <div className="detail-review-input-area">


                <div className="detail-review-label">


                  <label
                    htmlFor="movie-review"
                  >

                    한줄평

                  </label>


                  <span>

                    {review.length} / 500

                  </span>


                </div>


                <textarea

                  id="movie-review"

                  value={
                    review
                  }

                  maxLength="500"

                  onChange={
                    event =>
                      setReview(
                        event.target.value
                      )
                  }

                  placeholder="이 영화에 대한 생각을 남겨보세요."

                />


              </div>



              <div className="detail-rating-buttons">


                <button

                  type="button"

                  className="detail-rating-save"

                  onClick={
                    submitEvaluation
                  }

                  disabled={
                    saving
                    || deleting
                  }

                >

                  {
                    saving

                      ? '저장 중...'

                      : savedRating > 0

                        ? '평점 및 리뷰 수정'

                        : '평점 및 리뷰 저장'
                  }

                </button>


                {
                  savedRating > 0 && (

                    <button

                      type="button"

                      className="detail-rating-delete"

                      onClick={
                        removeEvaluation
                      }

                      disabled={
                        saving
                        || deleting
                      }

                    >

                      {
                        deleting

                          ? '삭제 중...'

                          : '평가 삭제'
                      }

                    </button>

                  )
                }


              </div>



              {
                message && (

                  <p className="detail-rating-message">

                    {message}

                  </p>

                )
              }


            </div>

          ) : (

            <p className="movie-detail-empty">

              평가를 등록하려면 먼저 사용자를 선택해주세요.

            </p>

          )
        }


      </section>



      {/* ===================================== */}
      {/* 다른 이용자들의 평가 */}
      {/* ===================================== */}

      <section className="movie-detail-section">


        <div className="movie-detail-section-title">


          <div>

            <p>
              COMMUNITY REVIEWS
            </p>

            <h2>

              다른 이용자들의 평가

            </h2>

          </div>


          <span>

            {otherRatings.length}개의 평가

          </span>


        </div>



        {
          otherRatings.length > 0 ? (

            <div className="detail-review-list">


              {
                otherRatings.map(
                  item => (

                    <article

                      key={
                        item.user_id
                      }

                      className="detail-review-card"

                    >


                      {/* 사용자 */}

                      <div className="detail-review-user">


                        <div className="detail-user-avatar">

                          👤

                        </div>


                        <div>

                          <strong>

                            {
                              item.user_name
                            }

                          </strong>


                          <span>

                            USER #{item.user_id}

                          </span>

                        </div>


                      </div>



                      {/* 평가 */}

                      <div className="detail-review-content">


                        <div className="detail-review-score">


                          <div className="detail-user-stars">


                            {[0,1,2,3,4].map(
                              index => {


                                const fill =
                                  Math.max(
                                    0,
                                    Math.min(
                                      1,
                                      Number(
                                        item.rating
                                      ) - index
                                    )
                                  )


                                return (

                                  <span

                                    key={index}

                                    className="detail-result-star"

                                  >


                                    <span className="detail-result-star-base">

                                      ★

                                    </span>


                                    <span

                                      className="detail-result-star-fill"

                                      style={{
                                        width:
                                          `${fill * 100}%`
                                      }}

                                    >

                                      <span>
                                        ★
                                      </span>

                                    </span>


                                  </span>

                                )

                              }
                            )}


                          </div>


                          <strong>

                            {
                              Number(
                                item.rating
                              ).toFixed(1)
                            }

                          </strong>


                        </div>



                        <p className={
                          item.review
                            ? 'detail-review-text'
                            : 'detail-review-text empty'
                        }>

                          {
                            item.review

                            || '작성한 한줄평이 없습니다.'
                          }

                        </p>


                      </div>


                    </article>

                  )
                )
              }


            </div>

          ) : (

            <div className="movie-detail-empty">

              아직 다른 이용자의 평가가 없습니다.

            </div>

          )
        }


      </section>


    </main>

  )

}