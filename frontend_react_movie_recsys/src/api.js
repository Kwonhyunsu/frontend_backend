import axios from 'axios'


const api = axios.create({

  baseURL:
    import.meta.env.VITE_API_BASE
    || 'http://127.0.0.1:8000'

})


// ==================================================
// 사용자
// ==================================================

export async function fetchUsers(){

  const { data } =
    await api.get(
      '/api/users'
    )

  return data
}


export async function createUser(name){

  const { data } =
    await api.post(
      '/api/users',
      {
        name
      }
    )

  return data
}


export async function updateUserName(
  userId,
  name
){

  const { data } =
    await api.patch(
      `/api/users/${userId}`,
      {
        name
      }
    )

  return data
}


export async function deleteUser(
  userId
){

  const { data } =
    await api.delete(
      `/api/users/${userId}`
    )

  return data
}


// ==================================================
// 추천
// ==================================================

export async function fetchRecommendations(
  userId,
  limit = 12
){

  const { data } =
    await api.get(
      '/api/recommend',
      {
        params: {
          user_id: userId,
          limit
        }
      }
    )

  return data
}


// ==================================================
// 영화
// ==================================================

export async function fetchMovies(){

  const { data } =
    await api.get(
      '/api/movies?limit=100'
    )

  return data
}


export async function fetchMovie(
  movieId
){

  const { data } =
    await api.get(
      `/api/movies/${movieId}`
    )

  return data
}


export async function createMovie(
  movie
){

  const { data } =
    await api.post(
      '/api/movies',
      movie
    )

  return data
}


export async function updateMovie(
  movieId,
  movie
){

  const { data } =
    await api.patch(
      `/api/movies/${movieId}`,
      movie
    )

  return data
}


export async function deleteMovie(
  movieId
){

  const { data } =
    await api.delete(
      `/api/movies/${movieId}`
    )

  return data
}


// ==================================================
// 영화별 평가
// ==================================================

export async function fetchMovieRatingSummary(
  movieId
){

  const { data } =
    await api.get(
      `/api/movies/${movieId}/ratings`
    )

  return data
}


// ==================================================
// 사용자 평점
// ==================================================

export async function fetchRatings(
  userId
){

  const { data } =
    await api.get(
      `/api/users/${userId}/ratings`
    )

  return data
}


// ==================================================
// 평점 + 리뷰 저장
//
// review를 안 넘기면
// 기존 review는 그대로 유지된다.
// ==================================================

export async function saveRating(
  userId,
  movieId,
  rating,
  review
){

  const payload = {

    movie_id:
      Number(movieId),

    rating:
      Number(rating)

  }


  // review가 실제 전달된 경우에만
  // JSON에 추가
  if(
    review !== undefined
  ){

    payload.review =
      review

  }


  const { data } =
    await api.post(
      `/api/users/${userId}/ratings`,
      payload
    )


  return data
}


// ==================================================
// 평가 삭제
// ==================================================

export async function deleteRating(
  userId,
  movieId
){

  const { data } =
    await api.delete(
      `/api/users/${userId}/ratings/${movieId}`
    )

  return data
}


// ==================================================
// 찜
// ==================================================

export async function fetchFavorites(
  userId
){

  const { data } =
    await api.get(
      `/api/users/${userId}/favorites`
    )

  return data
}


export async function addFavorite(
  userId,
  movieId
){

  const { data } =
    await api.post(
      `/api/users/${userId}/favorites/${movieId}`
    )

  return data
}


export async function removeFavorite(
  userId,
  movieId
){

  const { data } =
    await api.delete(
      `/api/users/${userId}/favorites/${movieId}`
    )

  return data
}


export default api