const PROTOTYPE_USERS = [
  {
    username: "operator",
    password: "packwise123",
    role: "operator",
    name: "Warehouse Operator"
  },
  {
    username: "manager",
    password: "packwise123",
    role: "manager",
    name: "Logistics Manager"
  }
];

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  const foundUser = PROTOTYPE_USERS.find(user => {
    return user.username === username && user.password === password;
  });

  if (!foundUser) {
    errorBox.textContent = "Invalid username or password.";
    return;
  }

  const loggedInUser = {
    username: foundUser.username,
    role: foundUser.role,
    name: foundUser.name,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem("packwise_user", JSON.stringify(loggedInUser));

  if (foundUser.role === "operator") {
    window.location.href = "session.html";
  } else {
    window.location.href = "index.html";
  }
}