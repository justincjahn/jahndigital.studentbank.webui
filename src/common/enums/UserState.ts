/**
 * The value persisted in localStorage to determine if the user has previously logged in.
 */
enum UserState {
  USER = 1,
  USER_PREREGISTRATION = 2,
  STUDENT = 3,
  STUDENT_PREREGISTRATION = 4,
}

export default UserState;
