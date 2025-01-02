export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  console.log("My JWT Token: " + token);
  return token ? true : false;
};
