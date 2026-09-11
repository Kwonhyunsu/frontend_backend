# 영화 추천 AI 웹서비스

React + FastAPI + MySQL을 이용하여 제작한 영화 추천 웹서비스입니다.

사용자가 영화에 평점과 리뷰를 남기면 해당 데이터를 활용하여 개인 맞춤 영화를 추천하고, 다른 사용자들의 영화 평가도 확인할 수 있도록 구현했습니다.

## 주요 기술

- Frontend: React, Vite
- Backend: FastAPI
- Database: MySQL
- ORM: SQLAlchemy
- API 통신: Axios
- 추천 방식: TF-IDF + Cosine Similarity

## 주요 기능

- 사용자 추가 / 수정 / 삭제 / 선택
- 영화 추가 / 수정 / 삭제 / 조회
- 영화 장르 다중 선택
- 영화 제목 / 장르 / 줄거리 검색
- 장르별 영화 필터링
- 인기순 / 평점순 / 최신순 등 정렬
- 0.5점 단위 영화 평점 등록 / 수정 / 삭제
- 영화 한줄평 작성 / 수정 / 삭제
- 영화별 평균 평점 확인
- 다른 사용자의 평점 및 리뷰 확인
- 영화 찜 / 찜 해제
- 사용자 평점을 기반으로 한 개인 맞춤 영화 추천
- 인기 콘텐츠 TOP 10
- Dark / Cinema / Light 테마 변경

## 프로젝트 구조

```text
React
  ↓ Axios
FastAPI
  ↓ SQLAlchemy
MySQL
