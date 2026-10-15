const gettokenlocalStorage = localStorage.getItem("token");
export const bearerHeader = {
  headers: {
    Authorization: `Bearer ${gettokenlocalStorage}`,
    Accept: "application/json",
  },
};
export const formDataHeader = {
  headers: {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${gettokenlocalStorage}`,
  },
};
