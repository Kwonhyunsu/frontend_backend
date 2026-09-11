import React, { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  fetchUsers,
  createUser,
  updateUserName,
  deleteUser
} from '../api'

import './Login.css'


export default function Login(){

  const navigate = useNavigate()


  // ================================================
  // 사용자 목록
  // ================================================

  const [users, setUsers] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')


  // ================================================
  // 사용자 추가
  // ================================================

  const [showAddUser, setShowAddUser] =
    useState(false)

  const [newUserName, setNewUserName] =
    useState('')


  // ================================================
  // 사용자 수정
  // ================================================

  const [editingUserId, setEditingUserId] =
    useState(null)

  const [editingName, setEditingName] =
    useState('')


  const [saving, setSaving] =
    useState(false)


  // ================================================
  // 처음 화면에서 사용자 목록 조회
  // ================================================

  useEffect(() => {

    loadUsers()

  }, [])


  async function loadUsers(){

    try {

      setLoading(true)

      setError('')


      const data =
        await fetchUsers()


      setUsers(data)


    } catch(error) {

      console.error(error)

      setError(
        '사용자 목록을 불러오지 못했습니다.'
      )


    } finally {

      setLoading(false)

    }

  }


  // ================================================
  // 사용자 선택
  // ================================================

  function selectUser(user){

    sessionStorage.setItem(
      'user_id',
      user.id
    )


    sessionStorage.setItem(
      'user_name',
      user.name
    )


    navigate(
      '/recommendations'
    )

  }


  // ================================================
  // 새로운 사용자 추가
  // ================================================

  async function addUser(event){

    event.preventDefault()


    const name =
      newUserName.trim()


    if(!name){

      alert(
        '사용자 이름을 입력해주세요.'
      )

      return

    }


    try {

      setSaving(true)


      const newUser =
        await createUser(name)


      setUsers(
        currentUsers => [

          ...currentUsers,

          newUser

        ]
      )


      setNewUserName('')

      setShowAddUser(false)


    } catch(error) {

      console.error(error)

      alert(
        '사용자 추가에 실패했습니다.'
      )


    } finally {

      setSaving(false)

    }

  }


  // ================================================
  // 이름 수정 시작
  // ================================================

  function startEdit(user){

    setEditingUserId(
      user.id
    )


    setEditingName(
      user.name
    )

  }


  // ================================================
  // 이름 수정 취소
  // ================================================

  function cancelEdit(){

    setEditingUserId(null)

    setEditingName('')

  }


  // ================================================
  // 이름 수정 저장
  // ================================================

  async function saveEdit(userId){

    const name =
      editingName.trim()


    if(!name){

      alert(
        '사용자 이름을 입력해주세요.'
      )

      return

    }


    try {

      setSaving(true)


      const updatedUser =
        await updateUserName(
          userId,
          name
        )


      setUsers(
        currentUsers =>

          currentUsers.map(
            user =>

              user.id === userId
                ? updatedUser
                : user

          )
      )


      cancelEdit()


    } catch(error) {

      console.error(error)

      alert(
        '사용자 이름 수정에 실패했습니다.'
      )


    } finally {

      setSaving(false)

    }

  }


  // ================================================
  // 사용자 삭제
  // ================================================

  async function removeUser(user){

    const confirmed =
      window.confirm(

        `'${user.name}' 사용자를 정말 삭제하시겠습니까?\n\n이 사용자가 등록한 영화 평점도 함께 삭제됩니다.`

      )


    if(!confirmed){

      return

    }


    try {

      await deleteUser(
        user.id
      )


      setUsers(
        currentUsers =>

          currentUsers.filter(
            currentUser =>
              currentUser.id !== user.id
          )

      )


      const selectedUserId =
        sessionStorage.getItem(
          'user_id'
        )


      if(
        Number(selectedUserId)
        === user.id
      ){

        sessionStorage.removeItem(
          'user_id'
        )

        sessionStorage.removeItem(
          'user_name'
        )

      }


    } catch(error) {

      console.error(error)

      alert(
        '사용자 삭제에 실패했습니다.'
      )

    }

  }


  // ================================================
  // 로딩
  // ================================================

  if(loading){

    return (

      <main className="login-page">

        <p className="profile-loading">

          사용자 정보를 불러오는 중...

        </p>

      </main>

    )

  }


  // ================================================
  // 오류
  // ================================================

  if(error){

    return (

      <main className="login-page">

        <p className="profile-error">

          {error}

        </p>

      </main>

    )

  }


  return (

    <main className="login-page">


      {/* ===================================== */}
      {/* 상단 제목 */}
      {/* 🎬 아이콘 완전히 제거 */}
      {/* ===================================== */}

      <section className="login-header">


        <p className="login-small-title">

          MOVIE RECOMMENDER

        </p>


        <h1 className="profile-title">

          영화 추천

        </h1>


        <p className="profile-description">

          시청할 사용자를 선택해주세요.

        </p>


      </section>



      {/* ===================================== */}
      {/* 사용자 목록 */}
      {/* ===================================== */}

      <section className="profile-grid">


        {
          users.map(user => (

            <article
              key={user.id}
              className="profile-card"
            >


              {/* 사용자 선택 영역 */}

              <button

                type="button"

                className="profile-select-area"

                onClick={() => {

                  if(
                    editingUserId
                    !== user.id
                  ){

                    selectUser(user)

                  }

                }}

              >


                <div className="profile-avatar">

                  👤

                </div>


                {
                  editingUserId
                  === user.id ? (

                    <div
                      className="profile-edit-area"
                      onClick={event =>
                        event.stopPropagation()
                      }
                    >


                      <input

                        type="text"

                        className="profile-edit-input"

                        value={editingName}

                        onChange={event =>
                          setEditingName(
                            event.target.value
                          )
                        }

                        onKeyDown={event => {

                          if(
                            event.key
                            === 'Enter'
                          ){

                            saveEdit(
                              user.id
                            )

                          }

                        }}

                        autoFocus

                      />


                      <p className="edit-user-description">

                        새로운 이름을 입력해주세요.

                      </p>


                    </div>

                  ) : (

                    <div className="profile-text">


                      <strong className="profile-name">

                        {user.name}

                      </strong>


                      <span className="profile-id">

                        USER #{user.id}

                      </span>


                    </div>

                  )
                }


              </button>



              {/* ================================= */}
              {/* 사용자 관리 버튼 */}
              {/* ================================= */}

              <div className="profile-actions">


                {
                  editingUserId
                  === user.id ? (

                    <>


                      <button

                        type="button"

                        className="profile-edit-button"

                        disabled={saving}

                        onClick={() =>
                          saveEdit(
                            user.id
                          )
                        }

                      >

                        {
                          saving
                            ? '저장 중...'
                            : '저장'
                        }

                      </button>


                      <button

                        type="button"

                        className="profile-delete-button"

                        onClick={
                          cancelEdit
                        }

                      >

                        취소

                      </button>


                    </>

                  ) : (

                    <>


                      <button

                        type="button"

                        className="profile-edit-button"

                        onClick={() =>
                          startEdit(user)
                        }

                      >

                        이름 수정

                      </button>


                      <button

                        type="button"

                        className="profile-delete-button"

                        onClick={() =>
                          removeUser(user)
                        }

                      >

                        삭제

                      </button>


                    </>

                  )
                }


              </div>


            </article>

          ))
        }



        {/* ===================================== */}
        {/* 새 사용자 추가 카드 */}
        {/* ===================================== */}

        {
          !showAddUser && (

            <button

              type="button"

              className="profile-card add-profile-card"

              onClick={() =>
                setShowAddUser(true)
              }

            >


              <div className="add-user-avatar">

                +

              </div>


              <strong className="profile-name">

                사용자 추가

              </strong>


              <span className="profile-id">

                새로운 프로필 만들기

              </span>


            </button>

          )
        }


      </section>



      {/* ===================================== */}
      {/* 사용자 추가 입력창 */}
      {/* ===================================== */}

      {
        showAddUser && (

          <section className="add-user-box">


            <h2>

              새 사용자 추가

            </h2>


            <p>

              영화 추천에 사용할
              사용자 이름을 입력해주세요.

            </p>


            <form
              className="add-user-form"
              onSubmit={addUser}
            >


              <input

                type="text"

                className="add-user-input"

                value={newUserName}

                onChange={event =>
                  setNewUserName(
                    event.target.value
                  )
                }

                placeholder="사용자 이름"

                autoFocus

              />


              <div className="add-user-buttons">


                <button

                  type="button"

                  className="add-user-cancel"

                  onClick={() => {

                    setShowAddUser(false)

                    setNewUserName('')

                  }}

                >

                  취소

                </button>


                <button

                  type="submit"

                  className="add-user-save"

                  disabled={saving}

                >

                  {
                    saving
                      ? '추가 중...'
                      : '사용자 추가'
                  }

                </button>


              </div>


            </form>


          </section>

        )
      }


    </main>

  )

}