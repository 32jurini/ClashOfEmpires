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
  document.querySelector('#player-flag').textContent = profile.flag;
  document.querySelector('#kingdom-location').textContent = profile.location;

  initVillage();
  loadLocalWeather(profile.location);
}

wireAccountForm(startGame);

document.querySelectorAll('[data-collect]').forEach((button) => {
  button.addEventListener('click', () => {
    collectResource(button.dataset.collect);
  });
});

document
  .querySelector('#campaign-button')
  .addEventListener('click', openGoblinCampaign);

document
  .querySelector('#clan-button')
  .addEventListener('click', openClan);

document.querySelector('#friends-button').addEventListener('click', () => {
  window.showToast('Friend search will arrive with online accounts.');
});

document.querySelector('#settings-button').addEventListener('click', () => {
  window.showToast('Settings will be added as the game grows.');
});

document.querySelector('#profile-button').addEventListener('click', () => {
  window.showToast('Your empire profile is coming soon.');
});

document.querySelector('#weather-button').addEventListener('click', () => {
  window.showToast('Local weather changes the scenery only.');
});
