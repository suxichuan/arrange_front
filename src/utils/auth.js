
export function getToken() {
  // return Cookies.get(TokenKey)
  return window.sessionStorage.getItem('token')
}

export function setToken(token) {
  // return Cookies.set(TokenKey, token)
  return window.sessionStorage.setItem('token', token)
}

export function removeToken() {
  // return Cookies.remove(TokenKey)
  return window.sessionStorage.removeItem('token')
}
