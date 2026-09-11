import React, {
  useEffect,
  useState
} from 'react'

import {
  Routes,
  Route,
  Link
} from 'react-router-dom'

import Recommendations
  from './pages/Recommendations'

import Login
  from './pages/Login'

import RatingsOverview
  from './pages/RatingsOverview'

import CommunityRatings
  from './pages/CommunityRatings'

import MovieManagement
  from './pages/MovieManagement'

import MovieDetail
  from './pages/MovieDetail'

import Favorites
  from './pages/Favorites'

import './App.css'


export default function App(){

  const [theme, setTheme] =
    useState(() => {

      return (
        localStorage.getItem(
          'movie_theme'
        )
        || 'dark'
      )

    })


  useEffect(() => {

    localStorage.setItem(
      'movie_theme',
      theme
    )

  }, [theme])


  return (

    <div
      className={`app theme-${theme}`}
    >


      {/* ===================================== */}
      {/* 상단 */}
      {/* ===================================== */}

      <header className="app-header">


        <div className="logo-area">

          <h2 className="logo-title">

            너의 영화 평점을 먹고싶어

          </h2>

        </div>



        {/* =================================== */}
        {/* 메뉴 */}
        {/* =================================== */}

        <nav className="app-nav">


          <Link
            className="nav-link"
            to="/"
          >
            홈
          </Link>


          <Link
            className="nav-link"
            to="/recommendations"
          >
            추천 영화
          </Link>


          <Link
            className="nav-link"
            to="/favorites"
          >
            찜
          </Link>


          <Link
            className="nav-link"
            to="/ratings"
          >
            평점
          </Link>


          <Link
            className="nav-link"
            to="/community"
          >
            커뮤니티
          </Link>


          <Link
            className="nav-link"
            to="/movies/manage"
          >
            영화 관리
          </Link>


        </nav>



        {/* =================================== */}
        {/* 테마 */}
        {/* =================================== */}

        <div className="theme-selector">


          <span className="theme-selector-label">

            화면

          </span>


          <div className="theme-buttons">


            <button

              type="button"

              className={
                theme === 'dark'
                  ? 'theme-button active'
                  : 'theme-button'
              }

              onClick={() =>
                setTheme('dark')
              }

            >

              <span
                className="theme-preview dark-preview"
              />

              <span>
                다크
              </span>

            </button>



            <button

              type="button"

              className={
                theme === 'cinema'
                  ? 'theme-button active'
                  : 'theme-button'
              }

              onClick={() =>
                setTheme('cinema')
              }

            >

              <span
                className="theme-preview cinema-preview"
              />

              <span>
                시네마
              </span>

            </button>



            <button

              type="button"

              className={
                theme === 'light'
                  ? 'theme-button active'
                  : 'theme-button'
              }

              onClick={() =>
                setTheme('light')
              }

            >

              <span
                className="theme-preview light-preview"
              />

              <span>
                라이트
              </span>

            </button>


          </div>


        </div>


      </header>



      {/* ===================================== */}
      {/* 페이지 */}
      {/* ===================================== */}

      <div className="app-content">


        <Routes>


          <Route
            path="/"
            element={
              <Login />
            }
          />


          <Route
            path="/recommendations"
            element={
              <Recommendations />
            }
          />


          <Route
            path="/favorites"
            element={
              <Favorites />
            }
          />


          <Route
            path="/ratings"
            element={
              <RatingsOverview />
            }
          />


          <Route
            path="/community"
            element={
              <CommunityRatings />
            }
          />


          <Route
            path="/movies/manage"
            element={
              <MovieManagement />
            }
          />


          <Route
            path="/movies/:movieId"
            element={
              <MovieDetail />
            }
          />


        </Routes>


      </div>


    </div>

  )

}