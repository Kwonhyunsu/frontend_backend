import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import {
  fetchRecommendations,
  fetchMovies,
  fetchRatings,
  fetchMovieRatingSummary
} from '../api'

import MovieCard
  from '../components/MovieCard'

import './Recommendations.css'


export default function Recommendations(){

  const navigate =
    useNavigate()


  const userId =
    sessionStorage.getItem(
      'user_id'
    )


  const storedUserName =
    sessionStorage.getItem(
      'user_name'
    )


  // ==================================================
  // 현재 화면
  //
  // home = OTT 추천 홈
  // all  = 전체 영화 보기
  // ==================================================

  const [pageMode, setPageMode] =
    useState('home')


  // ==================================================
  // 데이터
  // ==================================================

  const [movies, setMovies] =
    useState([])


  const [
    recommendations,
    setRecommendations
  ] = useState([])


  const [ratings, setRatings] =
    useState([])


  const [
    averageRatings,
    setAverageRatings
  ] = useState({})


  const [loading, setLoading] =
    useState(true)


  const [error, setError] =
    useState('')


  // ==================================================
  // 전체 영화 검색 / 필터 / 정렬
  // ==================================================

  const [
    searchText,
    setSearchText
  ] = useState('')


  const [
    selectedGenre,
    setSelectedGenre
  ] = useState('전체')


  const [
    sortOption,
    setSortOption
  ] = useState('popularity')


  // ==================================================
  // 가로 스크롤
  // ==================================================

  const popularRowRef =
    useRef(null)


  const recommendRowRef =
    useRef(null)


  // ==================================================
  // 사용자 이름
  // ==================================================

  const userName =
    storedUserName
    || `회원 #${userId}`


  // ==================================================
  // 데이터 불러오기
  // ==================================================

  useEffect(() => {

    async function loadHome(){

      try {

        setLoading(true)

        setError('')


        const [
          movieData,
          recommendationData,
          ratingData
        ] = await Promise.all([

          fetchMovies(),

          fetchRecommendations(
            userId,
            20
          ),

          fetchRatings(
            userId
          )

        ])


        setMovies(
          movieData
        )


        setRecommendations(
          recommendationData
        )


        setRatings(
          ratingData
        )


        // ============================================
        // 영화별 평균 평점 가져오기
        //
        // 전체 영화 정렬에 사용
        // ============================================

        const summaryResults =
          await Promise.all(

            movieData.map(
              async movie => {

                try {

                  const summary =
                    await fetchMovieRatingSummary(
                      movie.id
                    )


                  return {

                    movieId:
                      movie.id,

                    average:
                      Number(
                        summary.average_rating
                      ) || 0

                  }

                } catch(error) {

                  console.error(
                    `영화 ${movie.id} 평균 평점 조회 실패`,
                    error
                  )


                  return {

                    movieId:
                      movie.id,

                    average:
                      0

                  }

                }

              }
            )

          )


        const averageMap = {}


        summaryResults.forEach(
          item => {

            averageMap[
              item.movieId
            ] = item.average

          }
        )


        setAverageRatings(
          averageMap
        )


      } catch(error) {

        console.error(error)


        setError(
          '콘텐츠 정보를 불러오지 못했습니다.'
        )


      } finally {

        setLoading(false)

      }

    }


    if(userId){

      loadHome()

    } else {

      setLoading(false)

    }

  }, [userId])


  // ==================================================
  // 내 평점 Map
  // ==================================================

  const myRatingMap =
    useMemo(() => {

      const map = {}


      ratings.forEach(
        item => {

          map[
            item.movie_id
          ] = Number(
            item.rating
          )

        }
      )


      return map

    }, [ratings])


  // ==================================================
  // 인기 콘텐츠 TOP 10
  // ==================================================

  const popularMovies =
    useMemo(() => {

      return [

        ...movies

      ]
        .sort(
          (a, b) =>

            (
              Number(
                b.popularity
              ) || 0
            )

            -

            (
              Number(
                a.popularity
              ) || 0
            )
        )
        .slice(
          0,
          10
        )

    }, [movies])


  // ==================================================
  // 높은 평점을 준 영화
  // ==================================================

  const highRatedMovies =
    useMemo(() => {

      const movieMap = {}


      movies.forEach(
        movie => {

          movieMap[
            movie.id
          ] = movie

        }
      )


      return [

        ...ratings

      ]
        .filter(
          item =>
            Number(
              item.rating
            ) >= 4
        )
        .sort(
          (a, b) =>

            Number(
              b.rating
            )

            -

            Number(
              a.rating
            )
        )
        .map(
          item =>
            movieMap[
              item.movie_id
            ]
        )
        .filter(Boolean)
        .slice(
          0,
          3
        )

    }, [
      movies,
      ratings
    ])


  // ==================================================
  // 개인 추천 설명
  // ==================================================

  const recommendationDescription =
    useMemo(() => {

      if(
        highRatedMovies.length
        === 0
      ){

        return (
          '아직 높은 평점 데이터가 많지 않아 인기 콘텐츠를 중심으로 추천하고 있습니다.'
        )

      }


      const titles =
        highRatedMovies
          .map(
            movie =>
              `'${movie.title}'`
          )
          .join(', ')


      return (
        `${titles} 등 높은 평점을 남긴 작품과 비슷한 콘텐츠를 추천합니다.`
      )

    }, [highRatedMovies])


  // ==================================================
  // 장르 목록 만들기
  // ==================================================

  const genres =
    useMemo(() => {

      const genreSet =
        new Set()


      movies.forEach(
        movie => {

          if(!movie.genres){

            return

          }


          movie.genres
            .split(/[,/|]/)
            .map(
              genre =>
                genre.trim()
            )
            .filter(Boolean)
            .forEach(
              genre =>
                genreSet.add(
                  genre
                )
            )

        }
      )


      return [

        '전체',

        ...Array.from(
          genreSet
        ).sort()

      ]

    }, [movies])


  // ==================================================
  // 전체 영화
  //
  // 검색 + 장르 + 정렬
  // ==================================================

  const filteredMovies =
    useMemo(() => {

      let result = [
        ...movies
      ]


      // ============================================
      // 검색
      // ============================================

      const keyword =
        searchText
          .trim()
          .toLowerCase()


      if(keyword){

        result =
          result.filter(
            movie => {

              const title =
                (
                  movie.title
                  || ''
                ).toLowerCase()


              const genres =
                (
                  movie.genres
                  || ''
                ).toLowerCase()


              const overview =
                (
                  movie.overview
                  || ''
                ).toLowerCase()


              return (

                title.includes(
                  keyword
                )

                ||

                genres.includes(
                  keyword
                )

                ||

                overview.includes(
                  keyword
                )

              )

            }
          )

      }


      // ============================================
      // 장르
      // ============================================

      if(
        selectedGenre
        !== '전체'
      ){

        result =
          result.filter(
            movie => {

              if(!movie.genres){

                return false

              }


              const movieGenres =
                movie.genres
                  .split(/[,/|]/)
                  .map(
                    genre =>
                      genre.trim()
                  )


              return (
                movieGenres.includes(
                  selectedGenre
                )
              )

            }
          )

      }


      // ============================================
      // 정렬
      // ============================================

      result.sort(
        (a, b) => {


          // 인기순
          if(
            sortOption
            === 'popularity'
          ){

            return (

              (
                Number(
                  b.popularity
                ) || 0
              )

              -

              (
                Number(
                  a.popularity
                ) || 0
              )

            )

          }


          // 평균 평점
          if(
            sortOption
            === 'rating'
          ){

            return (

              (
                averageRatings[
                  b.id
                ] || 0
              )

              -

              (
                averageRatings[
                  a.id
                ] || 0
              )

            )

          }


          // 내 평점
          if(
            sortOption
            === 'my-rating'
          ){

            return (

              (
                myRatingMap[
                  b.id
                ] || 0
              )

              -

              (
                myRatingMap[
                  a.id
                ] || 0
              )

            )

          }


          // 최신순
          if(
            sortOption
            === 'latest'
          ){

            return (

              (
                Number(
                  b.year
                ) || 0
              )

              -

              (
                Number(
                  a.year
                ) || 0
              )

            )

          }


          // 오래된순
          if(
            sortOption
            === 'oldest'
          ){

            return (

              (
                Number(
                  a.year
                ) || 0
              )

              -

              (
                Number(
                  b.year
                ) || 0
              )

            )

          }


          // 제목순
          if(
            sortOption
            === 'title'
          ){

            return (
              a.title || ''
            ).localeCompare(
              b.title || '',
              'ko'
            )

          }


          return 0

        }
      )


      return result

    }, [
      movies,
      searchText,
      selectedGenre,
      sortOption,
      averageRatings,
      myRatingMap
    ])


  // ==================================================
  // 검색 초기화
  // ==================================================

  function resetFilters(){

    setSearchText('')

    setSelectedGenre(
      '전체'
    )

    setSortOption(
      'popularity'
    )

  }


  // ==================================================
  // 영화 상세
  // ==================================================

  function openMovie(movieId){

    navigate(
      `/movies/${movieId}`
    )

  }


  // ==================================================
  // 가로 스크롤
  // ==================================================

  function scrollRow(
    ref,
    direction
  ){

    if(!ref.current){

      return

    }


    const distance =
      720


    ref.current.scrollBy({

      left:
        direction
        === 'left'

          ? -distance

          : distance,

      behavior:
        'smooth'

    })

  }


  // ==================================================
  // MovieCard 평점 변경
  // ==================================================

  function handleRatingChange(
    movieId,
    newRating
  ){

    setRatings(
      currentRatings => {


        const found =
          currentRatings.some(
            item =>
              Number(
                item.movie_id
              )
              === Number(
                movieId
              )
          )


        if(
          Number(newRating)
          === 0
        ){

          return (
            currentRatings.filter(
              item =>
                Number(
                  item.movie_id
                )
                !== Number(
                  movieId
                )
            )
          )

        }


        if(found){

          return (
            currentRatings.map(
              item =>

                Number(
                  item.movie_id
                )
                === Number(
                  movieId
                )

                  ? {
                      ...item,
                      rating:
                        Number(
                          newRating
                        )
                    }

                  : item
            )
          )

        }


        return [

          ...currentRatings,

          {
            movie_id:
              Number(movieId),

            rating:
              Number(newRating)
          }

        ]

      }
    )

  }


  // ==================================================
  // 사용자 없음
  // ==================================================

  if(!userId){

    return (

      <main className="ott-home-page">


        <div className="ott-empty-state">


          <h2>

            사용자를 먼저 선택해주세요.

          </h2>


          <p>

            사용자별 평점을 기반으로
            서로 다른 추천 콘텐츠가 표시됩니다.

          </p>


          <button

            type="button"

            onClick={() =>
              navigate('/')
            }

          >

            사용자 선택

          </button>


        </div>


      </main>

    )

  }


  // ==================================================
  // 로딩
  // ==================================================

  if(loading){

    return (

      <p className="ott-home-message">

        콘텐츠를 불러오는 중...

      </p>

    )

  }


  // ==================================================
  // 오류
  // ==================================================

  if(error){

    return (

      <p className="ott-home-error">

        {error}

      </p>

    )

  }


  // ==================================================
  // 전체 영화 보기 화면
  // ==================================================

  if(
    pageMode
    === 'all'
  ){

    return (

      <main className="all-movies-page">


        {/* =================================== */}
        {/* 위쪽 */}
        {/* =================================== */}

        <section className="all-movies-header">


          <button

            type="button"

            className="back-home-button"

            onClick={() =>
              setPageMode(
                'home'
              )
            }

          >

            ← 추천 홈으로

          </button>


          <p className="all-movies-small-title">

            EXPLORE MOVIES

          </p>


          <h1>

            전체 영화 보기

          </h1>


          <p>

            제목이나 장르를 검색하고,
            원하는 기준으로 영화를 정렬해보세요.

          </p>


        </section>



        {/* =================================== */}
        {/* 검색 / 필터 */}
        {/* =================================== */}

        <section className="movie-filter-panel">


          {/* 검색 */}

          <div className="movie-search-area">


            <label
              htmlFor="movie-search"
            >

              영화 검색

            </label>


            <div className="movie-search-box">


              <input

                id="movie-search"

                type="text"

                value={
                  searchText
                }

                onChange={
                  event =>
                    setSearchText(
                      event.target.value
                    )
                }

                placeholder="영화 제목, 장르, 줄거리 검색"

              />


              {
                searchText && (

                  <button

                    type="button"

                    className="search-clear-button"

                    onClick={() =>
                      setSearchText('')
                    }

                  >

                    ×

                  </button>

                )
              }


            </div>


          </div>



          {/* 장르 */}

          <div className="movie-filter-field">


            <label
              htmlFor="genre-filter"
            >

              장르

            </label>


            <select

              id="genre-filter"

              value={
                selectedGenre
              }

              onChange={
                event =>
                  setSelectedGenre(
                    event.target.value
                  )
              }

            >


              {
                genres.map(
                  genre => (

                    <option

                      key={
                        genre
                      }

                      value={
                        genre
                      }

                    >

                      {genre}

                    </option>

                  )
                )
              }


            </select>


          </div>



          {/* 정렬 */}

          <div className="movie-filter-field">


            <label
              htmlFor="movie-sort"
            >

              정렬

            </label>


            <select

              id="movie-sort"

              value={
                sortOption
              }

              onChange={
                event =>
                  setSortOption(
                    event.target.value
                  )
              }

            >


              <option value="popularity">

                인기 높은 순

              </option>


              <option value="rating">

                평균 평점 높은 순

              </option>


              <option value="my-rating">

                내 평점 높은 순

              </option>


              <option value="latest">

                최신 영화 순

              </option>


              <option value="oldest">

                오래된 영화 순

              </option>


              <option value="title">

                제목 가나다순

              </option>


            </select>


          </div>



          {/* 초기화 */}

          <button

            type="button"

            className="movie-filter-reset"

            onClick={
              resetFilters
            }

          >

            초기화

          </button>


        </section>



        {/* =================================== */}
        {/* 결과 */}
        {/* =================================== */}

        <div className="movie-result-bar">


          <div>


            <span>

              검색 결과

            </span>


            <strong>

              {
                filteredMovies.length
              }

            </strong>


            <span>

              편

            </span>


          </div>


          {
            selectedGenre
            !== '전체' && (

              <span className="active-filter-badge">

                {selectedGenre}

              </span>

            )
          }


        </div>



        {/* =================================== */}
        {/* 결과 없음 */}
        {/* =================================== */}

        {
          filteredMovies.length
          === 0 ? (

            <div className="movie-no-result">


              <h2>

                검색 결과가 없습니다.

              </h2>


              <p>

                다른 검색어나 장르를
                선택해보세요.

              </p>


              <button

                type="button"

                onClick={
                  resetFilters
                }

              >

                필터 초기화

              </button>


            </div>

          ) : (

            <div className="all-movies-grid">


              {
                filteredMovies.map(
                  movie => (

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
                        myRatingMap[
                          movie.id
                        ] || 0
                      }

                      onRatingChange={
                        handleRatingChange
                      }

                    />

                  )
                )
              }


            </div>

          )
        }


      </main>

    )

  }


  // ==================================================
  // OTT 추천 홈
  // ==================================================

  return (

    <main className="ott-home-page">


      {/* ===================================== */}
      {/* 인사 */}
      {/* ===================================== */}

      <section className="ott-welcome">


        <p className="ott-welcome-small">

          PERSONALIZED HOME

        </p>


        <h1>

          {userName}님, 어떤 영화를 볼까요?

        </h1>


        <p>

          인기 콘텐츠와 회원님의
          평점 취향을 분석한 추천을 만나보세요.

        </p>


      </section>



      {/* ===================================== */}
      {/* 인기 TOP 10 */}
      {/* ===================================== */}

      <section className="ott-content-section">


        <div className="ott-section-header">


          <div>


            <p className="ott-section-small">

              TRENDING

            </p>


            <h2>

              현재 인기 콘텐츠 TOP 10

            </h2>


          </div>



          {/* 오른쪽 */}

          <div className="ott-section-actions">


            {/* =============================== */}
            {/* 전체 영화 보기 */}
            {/* =============================== */}

            <button

              type="button"

              className="all-movies-button"

              onClick={() =>
                setPageMode(
                  'all'
                )
              }

            >

              전체 영화 보기

              <span>
                →
              </span>

            </button>



            {/* 좌우 이동 */}

            <div className="ott-row-controls">


              <button

                type="button"

                onClick={() =>
                  scrollRow(
                    popularRowRef,
                    'left'
                  )
                }

              >

                ‹

              </button>


              <button

                type="button"

                onClick={() =>
                  scrollRow(
                    popularRowRef,
                    'right'
                  )
                }

              >

                ›

              </button>


            </div>


          </div>


        </div>



        <div

          className="ott-horizontal-row top10-row"

          ref={
            popularRowRef
          }

        >


          {
            popularMovies.map(
              (
                movie,
                index
              ) => (

                <article

                  key={
                    movie.id
                  }

                  className="top10-item"

                  onClick={() =>
                    openMovie(
                      movie.id
                    )
                  }

                >


                  <div className="top10-rank">

                    {
                      index + 1
                    }

                  </div>


                  <div className="top10-poster-wrapper">


                    {
                      movie.poster_url ? (

                        <img

                          src={
                            movie.poster_url
                          }

                          alt={
                            movie.title
                          }

                          className="top10-poster"

                        />

                      ) : (

                        <div className="top10-no-poster">

                          포스터 없음

                        </div>

                      )
                    }


                    <div className="top10-hover-info">


                      <strong>

                        {
                          movie.title
                        }

                      </strong>


                      <span>

                        {
                          movie.genres
                          || '장르 정보 없음'
                        }

                      </span>


                    </div>


                  </div>


                </article>

              )
            )
          }


        </div>


      </section>



      {/* ===================================== */}
      {/* 개인 추천 */}
      {/* ===================================== */}

      <section className="ott-content-section personalized-section">


        <div className="ott-section-header">


          <div>


            <p className="ott-section-small">

              FOR YOU

            </p>


            <h2>

              {userName}님에게 추천하는 콘텐츠

            </h2>


            <p className="ott-section-description">

              {
                recommendationDescription
              }

            </p>


          </div>


          <div className="ott-row-controls">


            <button

              type="button"

              onClick={() =>
                scrollRow(
                  recommendRowRef,
                  'left'
                )
              }

            >

              ‹

            </button>


            <button

              type="button"

              onClick={() =>
                scrollRow(
                  recommendRowRef,
                  'right'
                )
              }

            >

              ›

            </button>


          </div>


        </div>



        {
          recommendations.length
          === 0 ? (

            <div className="ott-no-recommendations">


              <h3>

                아직 추천 데이터가 부족합니다.

              </h3>


              <p>

                여러 영화에 평점을 남기면
                취향에 맞는 콘텐츠를
                추천할 수 있습니다.

              </p>


            </div>

          ) : (

            <div

              className="ott-horizontal-row recommend-row"

              ref={
                recommendRowRef
              }

            >


              {
                recommendations.map(
                  item => (

                    <article

                      key={
                        item.movie.id
                      }

                      className="ott-recommend-card"

                      onClick={() =>
                        openMovie(
                          item.movie.id
                        )
                      }

                    >


                      <div className="ott-recommend-poster-area">


                        {
                          item.movie.poster_url ? (

                            <img

                              src={
                                item.movie.poster_url
                              }

                              alt={
                                item.movie.title
                              }

                              className="ott-recommend-poster"

                            />

                          ) : (

                            <div className="ott-recommend-no-poster">

                              포스터 없음

                            </div>

                          )
                        }


                        <div className="ott-card-gradient" />


                        <div className="ott-card-info">


                          <strong>

                            {
                              item.movie.title
                            }

                          </strong>


                          <span>

                            {
                              item.movie.year
                                ? item.movie.year
                                : ''
                            }

                            {
                              item.movie.genres

                                ? ` · ${item.movie.genres}`

                                : ''
                            }

                          </span>


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



      {/* ===================================== */}
      {/* 추천 근거 */}
      {/* ===================================== */}

      {
        highRatedMovies.length > 0 && (

          <section className="taste-source-section">


            <div>


              <p>

                추천에 반영된 취향

              </p>


              <h3>

                높은 평점을 남긴 작품

              </h3>


            </div>


            <div className="taste-source-list">


              {
                highRatedMovies.map(
                  movie => (

                    <button

                      key={
                        movie.id
                      }

                      type="button"

                      onClick={() =>
                        openMovie(
                          movie.id
                        )
                      }

                    >

                      {
                        movie.title
                      }

                    </button>

                  )
                )
              }


            </div>


          </section>

        )
      }


    </main>

  )

}