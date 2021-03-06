import io from 'socket.io-client'

import Actions from '../store/actions';

const loginInProgress = () => ({
  type: Actions.loginInProgress,
});

const loginSuccess = payload => ({
  type: Actions.loginSuccess,
  payload,
});

const loginFail = payload => ({
  type: Actions.loginFail,
  payload,
});

export const login = ({ username, password }) => async dispatch => {
  await dispatch(loginInProgress());
  if (username.trim() == '' || password.trim() == '') {
    return dispatch(
      loginFail({
        errors: 'Fields cannot be empty',
      }),
    );
  }
  try {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${username}&password=${password}`,
    });

    const data = await res.json();

    if (data.success) {
      const socket=io.connect('http://localhost:5000')
      data.user.socket=socket
      socket.emit('login',{userid:data.user.id})
      dispatch(loginSuccess(data.user));
      return data.user;
    } else {
      dispatch(
        loginFail({
          errors: data.error,
        }),
      );
    }
  } catch (err) {
    dispatch(
      loginFail({
        errors: 'Could not connect to server',
      }),
    );
    return err;
  }
};
