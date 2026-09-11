import React, {
  useEffect,
  useState
} from 'react'

import {
  fetchMovies,
  createMovie,
  updateMovie,
  deleteMovie
} from '../api'

import './MovieManagement.css'


// ==================================================
// 사이트에서 사용할 표준 장르
//
// 앞으로 영화 등록 시 이 값만 선택할 수 있기 때문에
// 장르 데이터가 통일된다.
// ==================================================

const GENRE_OPTIONS = [
  '액션',
  '모험',
  '애니메이션',
  '코미디',
  '범죄',
  '다큐멘터리',
  '드라마',
  '가족',
  '판타지',
  '역사',
  '공포',
  '음악',
  '미스터리',
  '로맨스',
  'SF',
  '스릴러',
  '전쟁',
  '서부'
]


export default function MovieManagement(){

  // ==================================================
  // 영화 목록
  // ==================================================

  const [movies, setMovies] =
    useState([])


  const [loading, setLoading] =
    useState(true)


  const [error, setError] =
    useState('')


  const [saving, setSaving] =
    useState(false)


  // ==================================================
  // 수정 중인 영화
  // ==================================================

  const [
    editingMovieId,
    setEditingMovieId
  ] = useState(null)


  // ==================================================
  // 장르 선택창 열림 / 닫힘
  // ==================================================

  const [
    genreMenuOpen,
    setGenreMenuOpen
  ] = useState(false)


  // ==================================================
  // 입력 폼
  //
  // genres는 문자열이 아니라
  // 선택한 장르 배열로 관리한다.
  // ==================================================

  const emptyForm = {

    title: '',

    genres: [],

    overview: '',

    year: '',

    poster_url: '',

    popularity: ''

  }


  const [form, setForm] =
    useState(emptyForm)


  // ==================================================
  // 영화 목록
  // ==================================================

  useEffect(() => {

    loadMovies()

  }, [])


  async function loadMovies(){

    try {

      setLoading(true)

      setError('')


      const data =
        await fetchMovies()


      setMovies(
        data
      )


    } catch(error) {

      console.error(error)


      setError(
        '영화 목록을 불러오지 못했습니다.'
      )


    } finally {

      setLoading(false)

    }

  }


  // ==================================================
  // 일반 입력값 변경
  // ==================================================

  function changeForm(event){

    const {
      name,
      value
    } = event.target


    setForm(
      current => ({

        ...current,

        [name]:
          value

      })
    )

  }


  // ==================================================
  // 장르 선택 / 선택 해제
  // ==================================================

  function toggleGenre(genre){

    setForm(
      current => {

        const alreadySelected =
          current.genres.includes(
            genre
          )


        // 이미 선택되어 있으면 제거
        if(alreadySelected){

          return {

            ...current,

            genres:
              current.genres.filter(
                item =>
                  item !== genre
              )

          }

        }


        // 선택되어 있지 않으면 추가
        return {

          ...current,

          genres: [
            ...current.genres,
            genre
          ]

        }

      }
    )

  }


  // ==================================================
  // 장르 전체 삭제
  // ==================================================

  function clearGenres(){

    setForm(
      current => ({

        ...current,

        genres: []

      })
    )

  }


  // ==================================================
  // 폼 초기화
  // ==================================================

  function resetForm(){

    setForm(
      emptyForm
    )


    setEditingMovieId(
      null
    )


    setGenreMenuOpen(
      false
    )

  }


  // ==================================================
  // 영화 추가 / 수정
  // ==================================================

  async function saveMovie(event){

    event.preventDefault()


    if(
      !form.title.trim()
    ){

      alert(
        '영화 제목을 입력해주세요.'
      )

      return

    }


    // ================================================
    // genres 배열을 DB에 넣기 전
    //
    // ['액션', 'SF', '스릴러']
    //
    // ↓
    //
    // '액션, SF, 스릴러'
    // ================================================

    const movieData = {

      title:
        form.title.trim(),

      genres:
        form.genres.length > 0

          ? form.genres.join(', ')

          : null,

      overview:
        form.overview.trim()
        || null,

      year:
        form.year

          ? Number(
              form.year
            )

          : null,

      poster_url:
        form.poster_url.trim()
        || null,

      popularity:
        form.popularity

          ? Number(
              form.popularity
            )

          : 0

    }


    try {

      setSaving(true)


      // ============================================
      // 수정
      // ============================================

      if(
        editingMovieId !== null
      ){

        const updatedMovie =
          await updateMovie(

            editingMovieId,

            movieData

          )


        setMovies(
          currentMovies =>

            currentMovies.map(
              movie =>

                movie.id
                === updatedMovie.id

                  ? updatedMovie

                  : movie
            )
        )


        alert(
          '영화 정보가 수정되었습니다.'
        )

      }


      // ============================================
      // 추가
      // ============================================

      else {

        const createdMovie =
          await createMovie(
            movieData
          )


        setMovies(
          currentMovies => [

            ...currentMovies,

            createdMovie

          ]
        )


        alert(
          '새 영화가 추가되었습니다.'
        )

      }


      resetForm()


    } catch(error) {

      console.error(error)


      alert(

        editingMovieId !== null

          ? '영화 수정에 실패했습니다.'

          : '영화 추가에 실패했습니다.'

      )


    } finally {

      setSaving(false)

    }

  }


  // ==================================================
  // 수정 시작
  // ==================================================

  function startEdit(movie){

    setEditingMovieId(
      movie.id
    )


    // ================================================
    // DB에 저장된
    //
    // "액션, SF, 스릴러"
    //
    // 를
    //
    // ['액션', 'SF', '스릴러']
    //
    // 로 다시 변환
    // ================================================

    const movieGenres =
      movie.genres

        ? movie.genres
            .split(',')
            .map(
              genre =>
                genre.trim()
            )
            .filter(Boolean)

        : []


    setForm({

      title:
        movie.title || '',

      genres:
        movieGenres,

      overview:
        movie.overview || '',

      year:
        movie.year || '',

      poster_url:
        movie.poster_url || '',

      popularity:
        movie.popularity ?? ''

    })


    setGenreMenuOpen(
      false
    )


    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    })

  }


  // ==================================================
  // 영화 삭제
  // ==================================================

  async function removeMovie(movie){

    const confirmed =
      window.confirm(

        `'${movie.title}' 영화를 정말 삭제하시겠습니까?\n\n이 영화에 등록된 사용자 평점도 함께 삭제됩니다.`

      )


    if(!confirmed){

      return

    }


    try {

      await deleteMovie(
        movie.id
      )


      setMovies(
        currentMovies =>

          currentMovies.filter(
            currentMovie =>

              currentMovie.id
              !== movie.id

          )
      )


      if(
        editingMovieId
        === movie.id
      ){

        resetForm()

      }


      alert(
        '영화가 삭제되었습니다.'
      )


    } catch(error) {

      console.error(error)


      alert(
        '영화 삭제에 실패했습니다.'
      )

    }

  }


  return (

    <main className="movie-management-page">


      {/* ===================================== */}
      {/* 상단 */}
      {/* ===================================== */}

      <section className="movie-management-header">


        <p className="movie-management-small-title">

          영화 데이터 관리

        </p>


        <h1>

          영화 관리

        </h1>


        <p>

          영화 데이터를 추가하거나
          수정·삭제할 수 있습니다.

        </p>


      </section>



      {/* ===================================== */}
      {/* 영화 추가 / 수정 */}
      {/* ===================================== */}

      <section className="movie-form-section">


        <h2>

          {
            editingMovieId !== null

              ? `영화 수정 #${editingMovieId}`

              : '새 영화 추가'
          }

        </h2>



        <form
          className="movie-form"
          onSubmit={saveMovie}
        >


          {/* ================================= */}
          {/* 제목 */}
          {/* ================================= */}

          <div className="movie-form-group">


            <label>

              영화 제목 *

            </label>


            <input

              name="title"

              value={
                form.title
              }

              onChange={
                changeForm
              }

              placeholder="예: 인셉션"

            />


          </div>



          {/* ================================= */}
          {/* 장르 선택 */}
          {/* ================================= */}

          <div className="movie-form-group genre-form-group">


            <label>

              장르

            </label>



            {/* =============================== */}
            {/* 현재 선택된 장르 표시 영역 */}
            {/* =============================== */}

            <button

              type="button"

              className={
                genreMenuOpen

                  ? 'genre-selector open'

                  : 'genre-selector'
              }

              onClick={() =>
                setGenreMenuOpen(
                  current =>
                    !current
                )
              }

            >


              <span
                className={
                  form.genres.length > 0

                    ? 'genre-selector-value'

                    : 'genre-selector-placeholder'
                }
              >

                {
                  form.genres.length > 0

                    ? form.genres.join(', ')

                    : '장르를 선택해주세요.'
                }

              </span>


              <span
                className={
                  genreMenuOpen

                    ? 'genre-arrow open'

                    : 'genre-arrow'
                }
              >

                ▼

              </span>


            </button>



            {/* =============================== */}
            {/* 장르 선택 메뉴 */}
            {/* =============================== */}

            {
              genreMenuOpen && (

                <div className="genre-menu">


                  <div className="genre-menu-header">


                    <div>


                      <strong>

                        장르 선택

                      </strong>


                      <span>

                        여러 개 선택할 수 있습니다.

                      </span>


                    </div>



                    {
                      form.genres.length > 0 && (

                        <button

                          type="button"

                          className="genre-clear-button"

                          onClick={
                            clearGenres
                          }

                        >

                          전체 해제

                        </button>

                      )
                    }


                  </div>



                  <div className="genre-option-list">


                    {
                      GENRE_OPTIONS.map(
                        genre => {


                          const selected =
                            form.genres.includes(
                              genre
                            )


                          return (

                            <button

                              key={
                                genre
                              }

                              type="button"

                              className={
                                selected

                                  ? 'genre-option selected'

                                  : 'genre-option'
                              }

                              onClick={() =>
                                toggleGenre(
                                  genre
                                )
                              }

                            >

                              {
                                selected
                                && (

                                  <span className="genre-check">

                                    ✓

                                  </span>

                                )
                              }


                              {genre}


                            </button>

                          )

                        }
                      )
                    }


                  </div>



                  <div className="genre-menu-footer">


                    <span>

                      {
                        form.genres.length
                      }개 선택됨

                    </span>


                    <button

                      type="button"

                      className="genre-done-button"

                      onClick={() =>
                        setGenreMenuOpen(
                          false
                        )
                      }

                    >

                      선택 완료

                    </button>


                  </div>


                </div>

              )
            }



            {/* =============================== */}
            {/* 선택된 장르 칩 */}
            {/* =============================== */}

            {
              form.genres.length > 0 && (

                <div className="selected-genre-list">


                  {
                    form.genres.map(
                      genre => (

                        <button

                          key={
                            genre
                          }

                          type="button"

                          className="selected-genre-chip"

                          onClick={() =>
                            toggleGenre(
                              genre
                            )
                          }

                          title="클릭하면 선택 해제"

                        >

                          {genre}

                          <span>
                            ×
                          </span>

                        </button>

                      )
                    )
                  }


                </div>

              )
            }


          </div>



          {/* ================================= */}
          {/* 개봉연도 */}
          {/* ================================= */}

          <div className="movie-form-group">


            <label>

              개봉연도

            </label>


            <input

              name="year"

              type="number"

              value={
                form.year
              }

              onChange={
                changeForm
              }

              placeholder="예: 2010"

            />


          </div>



          {/* ================================= */}
          {/* 인기도 */}
          {/* ================================= */}

          <div className="movie-form-group">


            <label>

              인기도

            </label>


            <input

              name="popularity"

              type="number"

              step="0.1"

              value={
                form.popularity
              }

              onChange={
                changeForm
              }

              placeholder="예: 98"

            />


          </div>



          {/* ================================= */}
          {/* 포스터 URL */}
          {/* ================================= */}

          <div className="movie-form-group full">


            <label>

              포스터 URL

            </label>


            <input

              name="poster_url"

              value={
                form.poster_url
              }

              onChange={
                changeForm
              }

              placeholder="https://image.tmdb.org/..."

            />


          </div>



          {/* ================================= */}
          {/* 줄거리 */}
          {/* ================================= */}

          <div className="movie-form-group full">


            <label>

              영화 줄거리

            </label>


            <textarea

              name="overview"

              value={
                form.overview
              }

              onChange={
                changeForm
              }

              placeholder="영화 줄거리를 입력해주세요."

              rows="5"

            />


          </div>



          {/* ================================= */}
          {/* 버튼 */}
          {/* ================================= */}

          <div className="movie-form-buttons">


            {
              editingMovieId !== null && (

                <button

                  type="button"

                  className="movie-cancel-button"

                  onClick={
                    resetForm
                  }

                >

                  수정 취소

                </button>

              )
            }


            <button

              type="submit"

              className="movie-save-button"

              disabled={
                saving
              }

            >

              {
                saving

                  ? '저장 중...'

                  : editingMovieId !== null

                    ? '영화 수정'

                    : '영화 추가'
              }

            </button>


          </div>


        </form>


      </section>



      {/* ===================================== */}
      {/* 등록 영화 목록 */}
      {/* ===================================== */}

      <section className="movie-list-section">


        <div className="movie-list-title">


          <h2>

            등록된 영화

          </h2>


          <span>

            총 {movies.length}개

          </span>


        </div>



        {
          loading ? (

            <p className="movie-management-message">

              영화를 불러오는 중...

            </p>

          ) : error ? (

            <p className="movie-management-error">

              {error}

            </p>

          ) : (

            <div className="movie-management-grid">


              {
                movies.map(
                  movie => (

                    <article

                      key={
                        movie.id
                      }

                      className="management-movie-card"

                    >


                      {/* 포스터 */}

                      <div className="management-poster-area">


                        {
                          movie.poster_url ? (

                            <img

                              src={
                                movie.poster_url
                              }

                              alt={
                                movie.title
                              }

                              className="management-poster"

                              onError={
                                event => {

                                  event
                                    .currentTarget
                                    .style
                                    .display =
                                      'none'

                                }
                              }

                            />

                          ) : (

                            <div className="management-no-poster">

                              포스터 없음

                            </div>

                          )
                        }


                      </div>



                      {/* 정보 */}

                      <div className="management-movie-info">


                        <span className="management-id">

                          MOVIE #{movie.id}

                        </span>


                        <h3>

                          {movie.title}

                        </h3>



                        {/* 장르 표시 */}

                        {
                          movie.genres ? (

                            <div className="management-genre-list">


                              {
                                movie.genres
                                  .split(',')
                                  .map(
                                    genre =>
                                      genre.trim()
                                  )
                                  .filter(Boolean)
                                  .map(
                                    genre => (

                                      <span
                                        key={
                                          genre
                                        }
                                      >

                                        {genre}

                                      </span>

                                    )
                                  )
                              }


                            </div>

                          ) : (

                            <p className="management-meta">

                              장르 정보 없음

                            </p>

                          )
                        }


                        {
                          movie.year && (

                            <p className="management-year">

                              {movie.year}년

                            </p>

                          )
                        }


                        <p className="management-overview">

                          {
                            movie.overview
                            || '줄거리 정보가 없습니다.'
                          }

                        </p>


                        <p className="management-popularity">

                          Popularity:

                          {' '}

                          {
                            movie.popularity
                            ?? 0
                          }

                        </p>



                        {/* 수정 / 삭제 */}

                        <div className="management-buttons">


                          <button

                            type="button"

                            className="management-edit"

                            onClick={() =>
                              startEdit(
                                movie
                              )
                            }

                          >

                            수정

                          </button>


                          <button

                            type="button"

                            className="management-delete"

                            onClick={() =>
                              removeMovie(
                                movie
                              )
                            }

                          >

                            삭제

                          </button>


                        </div>


                      </div>


                    </article>

                  )
                )
              }


            </div>

          )
        }


      </section>


    </main>

  )

}