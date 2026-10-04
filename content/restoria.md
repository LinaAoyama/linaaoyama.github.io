---
layout: page
title: Restoria
---

<p class="restoria-intro">
My husband and I created a board game, Restoria, as a way to communicate my California grasslands research to friends, family, and anyone interested in California native plants. See the website below to learn more.
</p>

<div class="restoria-card">
  <a href="https://playrestoria.pages.dev" aria-label="Restoria game box" target="_blank" rel="noopener">
    <img src="/assets/img/restoria/WhiteBoxSmall.jpg" alt="">
  </a>
  <div>
    <h2>Restoria</h2>
    <p>A light-weight strategy card game that incorporates community ecology concepts and features 31 species of California plants.</p>
    <a class="restoria-button" href="https://playrestoria.pages.dev" target="_blank" rel="noopener">View Website</a>
  </div>
</div>

<style>
  .restoria-intro {
    text-align: center;
    color: #5a5a5a;
    font-size: 1.05rem;
    line-height: 1.65;
    max-width: 40rem;
    margin: 0 auto 2rem;
  }
  .restoria-card {
    display: flex;
    align-items: flex-start;
    gap: 1.75rem;
    border: 1px solid #e6e6e6;
    padding: 1.35rem 1.5rem 1.5rem;
    max-width: 760px;
    margin: 0 auto 2.5rem;
  }
  .restoria-card img {
    width: 280px;
    max-width: 100%;
    height: auto;
    display: block;
  }
  .restoria-card h2 {
    margin: 0.15rem 0 0.7rem;
    font-size: 1.05rem;
    font-weight: 700;
    color: #222;
  }
  .restoria-card p {
    margin: 0 0 1.15rem;
    font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 0.98rem;
    line-height: 1.5;
    color: #444;
  }
  .restoria-card a.restoria-button {
    display: inline-block;
    background: #f5a022;
    color: #fff;
    text-decoration: none;
    font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 0.55rem 1.15rem;
    border-radius: 4px;
  }
  .restoria-card a.restoria-button:hover,
  .restoria-card a.restoria-button:focus {
    background: #e09010;
    color: #fff;
    text-decoration: none;
  }
  @media (max-width: 600px) {
    .restoria-card {
      flex-direction: column;
    }
    .restoria-card img {
      width: min(100%, 300px);
    }
  }
</style>
