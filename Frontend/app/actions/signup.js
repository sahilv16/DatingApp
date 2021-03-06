import io from 'socket.io-client'

import Actions from '../store/actions';

const SignupInProgress = () => ({
  type: Actions.SignupInProgress,
});

const SignupSuccess = payload => ({
  type: Actions.SignupSuccess,
  payload,
});

const SignupFail = payload => ({
  type: Actions.SignupFail,
  payload,
});

export const signup = ({ username, password, passwordAgain, image }) => async dispatch => {
  await dispatch(SignupInProgress());
  if (username.trim() == '' || password.trim() == '' || passwordAgain.trim() == '' || image.trim() == '') {
    return dispatch(
      SignupFail({
        errors: 'Fields cannot be empty',
      }),
    );
  }
  try {
    if (password == passwordAgain) {
      const res = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}&image=${image}`,
      });
      const data = await res.json();
      if (data.success) {
        const socket = io.connect('http://localhost:5000')
        data.user.socket = socket
        socket.emit('login',{userid:data.user.id})
        dispatch(SignupSuccess(data.user));
      } else if (data.exist) {
        dispatch(
          SignupFail({
            errors: data.errors,
          }),
        );
      } else {
        return dispatch(
          SignupFail({
            errors: 'Could not connect to Server . Please try again later',
          }),
        );
      }
    } else {
      return dispatch(
        SignupFail({
          errors: 'Passwords does not match',
        }),
      );
    }
  } catch (err) {
    console.log(err);
    return dispatch(
      SignupFail({
        errors: 'Could not connect to database',
      }),
    );
  }
};
