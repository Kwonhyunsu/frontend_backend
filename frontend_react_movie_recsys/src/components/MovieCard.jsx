import React, {
  useEffect,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  saveRating,
  deleteRating
} from '../api'

import './MovieCard.css'


export default function MovieCard({

  movie,
  score,
  userId,
  initialRating = 0,
  onRatingChange

}){

  const navigate =
    useNavigate()


  const [rating, setRating] =
    useState(
      Number(initialRating) || 0
    )


  const [savedRating, setSavedRating] =
    useState(
      Number(initialRating) || 0
    )


  const [saving, setSaving] =
    useState(false)


  const [deleting, setDeleting] =
    useState(false)


  const [message, setMessage] =
    useState('')


  useEffect(() => {

    const value =
      Number(initialRating) || 0

    setRating(value)
    setSavedRating(value)

  }, [initialRating])


  // ================================================
  // 상세페이지 이동
  // ================================================

  function openDetail(){

    navigate(
      `/movies/${movie.id}`
    )

  }


  // ================================================
  // 별점 선택
  // ================================================

  function selectRating(value){

    setRating(value)

    setMessage('')

  }


  // ================================================
  // 평점 저장
  // ================================================

  async function submitRating(){

    if(rating === 0){

      alert(
        '별점을 먼저 선택해주세요.'
      )

      return

    }


    try {

      setSaving(true)

      setMessage('')


      const result =
        await saveRating(
          userId,
          movie.id,
          rating
        )


      const newRating =
        Number(result.rating)


      setRating(newRating)

      setSavedRating(newRating)


      if(onRatingChange){

        onRatingChange(
          movie.id,
          newRating
        )

      }


      setMessage(
        '평점이 저장되었습니다.'
      )


    } catch(error) {

      console.error(error)

      setMessage(
        '평점 저장에 실패했습니다.'
      )


    } finally {

      setSaving(false)

    }

  }


  // ================================================
  // 평점 삭제
  // ================================================

  async function removeRating(){

    if(savedRating === 0){

      return

    }


    const confirmed =
      window.confirm(
        `'${movie.title}'에 남긴 평점을 삭제하시겠습니까?`
      )


    if(!confirmed){

      return

    }


    try {

      setDeleting(true)

      setMessage('')


      await deleteRating(
        userId,
        movie.id
      )


      setRating(0)

      setSavedRating(0)


      if(onRatingChange){

        onRatingChange(
          movie.id,
          0
        )

      }


      setMessage(
        '평점이 삭제되었습니다.'
      )


    } catch(error) {

      console.error(error)

      setMessage(
        '평점 삭제에 실패했습니다.'
      )


    } finally {

      setDeleting(false)

    }

  }


  return (

    <div className="movie-card">


      {/* ===================================== */}
      {/* 포스터 - 클릭하면 상세보기 */}
      {/* ===================================== */}

      <div
        className="poster-wrapper"
        onClick={openDetail}
        style={{
          cursor: 'pointer'
        }}
      >


        {
          movie.poster_url && (

            <img

              className="movie-poster"

              src={movie.poster_url}

              alt={movie.title}

              onError={event => {

                event.currentTarget.style.display =
                  'none'

              }}

            />

          )
        }


      </div>



      <div className="movie-info">


        {/* 제목 */}

        <h3
          className="movie-title"
          onClick={openDetail}
          style={{
            cursor: 'pointer'
          }}
        >

          {movie.title}

        </h3>



        <div className="movie-meta">

          {movie.genres}

          {
            movie.year
              ? ` • ${movie.year}`
              : ''
          }

        </div>



        {/* 추천 점수 */}

        {
          typeof score === 'number' && (

            <div className="movie-score">

              <span className="score-label">

                AI MATCH

              </span>

              <span className="score-value">

                {score.toFixed(3)}

              </span>

            </div>

          )
        }



        {
          movie.overview && (

            <p className="movie-overview">

              {movie.overview}

            </p>

          )
        }



        {/* ================================= */}
        {/* 별점 */}
        {/* ================================= */}

        <div className="rating-area">


          <span className="rating-title">

            이 영화는 어떠셨나요?

          </span>


          <div className="half-star-rating">


            {[0, 1, 2, 3, 4].map(
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
                    className="half-star-item"
                  >


                    <span className="half-star-base">

                      ★

                    </span>


                    <span
                      className="half-star-fill"
                      style={{
                        width:
                          `${fill * 100}%`
                      }}
                    >

                      ★

                    </span>


                    <button

                      type="button"

                      className="half-star-click left"

                      onClick={() =>
                        selectRating(
                          index + 0.5
                        )
                      }

                    />


                    <button

                      type="button"

                      className="half-star-click right"

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



          <div className="rating-number">

            {
              rating > 0

                ? `${rating.toFixed(1)} / 5`

                : '별점을 선택해주세요.'
            }

          </div>



          <div className="rating-action-buttons">


            <button

              type="button"

              className="rating-save-button"

              onClick={submitRating}

              disabled={
                saving || deleting
              }

            >

              {
                saving
                  ? '저장 중...'
                  : savedRating > 0
                    ? '평점 수정'
                    : '평점 저장'
              }

            </button>



            {
              savedRating > 0 && (

                <button

                  type="button"

                  className="rating-delete-button"

                  onClick={removeRating}

                  disabled={
                    saving || deleting
                  }

                >

                  {
                    deleting
                      ? '삭제 중...'
                      : '평점 삭제'
                  }

                </button>

              )
            }


          </div>


          {
            message && (

              <p className="rating-message">

                {message}

              </p>

            )
          }


        </div>


      </div>


    </div>

  )

}