import { wireAccountForm } from './auth.js';
import { initVillage, collectResource } from './village.js';
import { loadLocalWeather } from './weather.js';
import { openGoblinCampaign, openClan } from './battles.js';

const onboarding = document.querySelector('#onboarding');
const game = document.querySelector('#game');

window.showToast = (message) => {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
};

function startGame(profile) {
  onboarding.hidden = true;
  game.hidden = false;

  document.querySelector('#player-name').textContent = profile.username;
  document.querySelector('#card-player-name').textContent = profile.username;
  document.querySelector('#empire-name').textContent =
    `${profile.username.toUpperCase()}'S EMPIRE`;
  document.querySelector('#player-flag').textContent = profile.flag;
  document.querySelector('#avatar-flag').textContent = profile.flag;

  initVillage();
  loadLocalWeather(profile.location);
}

wireAccountForm(startGame);

document.querySelectorAll('[data-collect]').forEach((button) => {
  button.addEventListener('click', () => {
    collectResource(button.dataset.collect);
  });
});

document.querySelector('#campaign-button').addEventListener('click', openGoblinCampaign);
document.querySelector('#clan-button').addEventListener('click', openClan);
document.querySelector('#nav-clan').addEventListener('click', openClan);

document.querySelector('#friends-button').addEventListener('click', () => {
  window.showToast('Friend search will arrive with online accounts.');
});

document.querySelector('#profile-button').addEventListener('click', () => {
  window.showToast('Profile and account settings are planned.');
});

document.querySelector('#settings-button').addEventListener('click', () => {
  window.showToast('Settings will be added as the game grows.');
});

document.querySelector('#nav-army').addEventListener('click', () => {
  window.showToast('Your army will be available after building Barracks.');
});

document.querySelector('#nav-social').addEventListener('click', () => {
  window.showToast('Friends and clans will be connected to the online database.');
});
