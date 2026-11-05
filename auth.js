/*
  Prototype account screen only.
  Passwords are not saved in this browser demo.
  Real accounts need a secure online authentication server.
*/

const DEMO_PROFILE_KEY = 'coe-prototype-profile';

export function wireAccountForm(onStart) {
  const form = document.querySelector('#account-form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value;
    const location = document.querySelector('#location').value.trim();
    const flag = document.querySelector('#flag').value;

    if (username.length < 3 || password.length < 8 || !location) {
      return;
    }

    // This is a local prototype; the password is never stored.
    const profile = { username, location, flag };
    sessionStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));

    onStart(profile);

    document.querySelector('#password').value = '';
  });
}

export function getDemoProfile() {
  try {
    return JSON.parse(sessionStorage.getItem(DEMO_PROFILE_KEY) || 'null');
  } catch {
    return null;
  }
}
