let currentAudio = null;
let currentSongIndex = -1;
let isPlaying = false;
let playlistData = [];

document.addEventListener('DOMContentLoaded', function () {
    fetch('spotify.json')
        .then(response => response.json())
        .then(data => {
            playlistData = data.playlist;
            const playlistElement = document.getElementById('playlist');

            playlistData.forEach((song, index) => {
                const songElement = document.createElement('div');
                songElement.className = 'playlist-item';
                songElement.innerHTML = `
                    <img src="${song.image}" alt="${song.namesong}">
                    <div class="playlist-item-info">
                        <h4>${song.namesong}</h4>
                        <p>${song.author}</p>
                    </div>
                    <div class="playlist-item-duration">${song.durasi}</div>
                `;
                songElement.addEventListener('click', () => {
                    if (currentSongIndex === index) {
                        togglePlayPause();
                    } else {
                        playSong(song, index);
                    }
                });
                playlistElement.appendChild(songElement);
            });

if (playlistData.length > 0) {
    showSongUIOnly(playlistData[0], 0);
}
        });

    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            togglePlayPause();
        });
    }

    document.querySelector('.progress-container').addEventListener('click', function (e) {
        if (!currentAudio) return;
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = currentAudio.duration;
        currentAudio.currentTime = (clickX / width) * duration;
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({ top: targetElement.offsetTop - 20, behavior: 'smooth' });
            }
        });
    });
});

function updateUIDisplay(song, index) {
    document.getElementById('songTitle').textContent = song.namesong;
    document.getElementById('songArtist').textContent = song.author;
    document.getElementById('albumArt').style.backgroundImage = `url('${song.image}')`;
    document.getElementById('duration').textContent = song.durasi;

    document.querySelectorAll('.playlist-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.playlist-item')[index].classList.add('active');
    currentSongIndex = index;
    isPlaying = false;
}

function showSongUIOnly(song, index) {
  document.getElementById('songTitle').textContent = song.namesong;
  document.getElementById('songArtist').textContent = song.author;
  document.getElementById('albumArt').style.backgroundImage = `url('${song.image}')`;
  document.getElementById('duration').textContent = song.durasi;

  document.querySelectorAll('.playlist-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.playlist-item')[index].classList.add('active');

  currentSongIndex = index;
  isPlaying = false;
  currentAudio = new Audio(song.song); // siapkan audio tapi jangan di-play
  currentAudio.volume = 1.0;
}

function playSong(song, index) {
    // Hentikan audio sebelumnya
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeEventListener('timeupdate', updateProgressBar);
        currentAudio.removeEventListener('ended', playNextSong);
    }

    currentAudio = new Audio(song.song);
    currentAudio.volume = 1.0; // maksimum volume
    currentSongIndex = index;
    isPlaying = true;

    document.getElementById('songTitle').textContent = song.namesong;
    document.getElementById('songArtist').textContent = song.author;
    document.getElementById('albumArt').style.backgroundImage = `url('${song.image}')`;
    document.getElementById('duration').textContent = song.durasi;

    document.querySelectorAll('.playlist-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.playlist-item')[index].classList.add('active');

    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

    currentAudio.play();
    currentAudio.addEventListener('timeupdate', updateProgressBar);
    currentAudio.addEventListener('ended', () => {
    isPlaying = false;
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});
}

function togglePlayPause() {
    if (!currentAudio) return;
    const playPauseBtn = document.getElementById('playPauseBtn');

    if (isPlaying) {
        currentAudio.pause();
        isPlaying = false;
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        currentAudio.play();
        currentAudio.addEventListener('timeupdate', updateProgressBar); // << Tambahkan ini!
        isPlaying = true;
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function updateProgressBar() {
    if (!currentAudio) return;
    const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
    document.getElementById('progressBar').style.width = `${percent}%`;

    const minutes = Math.floor(currentAudio.currentTime / 60);
    const seconds = Math.floor(currentAudio.currentTime % 60).toString().padStart(2, '0');
    document.getElementById('currentTime').textContent = `${minutes}:${seconds}`;
}

function playNextSong() {
    const nextIndex = (currentSongIndex + 1) % playlistData.length;
    playSong(playlistData[nextIndex], nextIndex);
}

function nextSong() {
    playNextSong();
}

function prevSong() {
    const prevIndex = (currentSongIndex - 1 + playlistData.length) % playlistData.length;
    playSong(playlistData[prevIndex], prevIndex);
}