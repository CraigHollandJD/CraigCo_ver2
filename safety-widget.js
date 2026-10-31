/** CrAIgCo Safety First widget, v1.0. No third-party dependencies. */
(function(){
  'use strict';
  if(document.getElementById('craigco-safety-launch')) return;
  const script=document.currentScript;
  const assetBase=script ? new URL('../assets/',script.src).href : '/assets/';
  const button=document.createElement('button');
  button.id='craigco-safety-launch';button.className='craigco-safety-launch';
  button.type='button';button.setAttribute('aria-haspopup','dialog');button.textContent='⚠ Safety First · Site Under Construction';
  const dialog=document.createElement('dialog');dialog.className='craigco-safety-dialog';dialog.id='craigco-safety-dialog';
  dialog.setAttribute('aria-label','CrAIgCo safety first notice');
  const panel=document.createElement('figure');panel.className='craigco-safety-panel';
  const img=document.createElement('img');img.src=assetBase+'craigco-safety-first.png';img.alt='CrAIgCo Safety First: Site under construction. AI information is unverified. Links and features under testing. Do not rely on the site for health, legal, financial or safety decisions. Do not enter personal information. Coming soon: Global AI Safety.';img.loading='lazy';
  const close=document.createElement('button');close.type='button';close.className='craigco-safety-close';close.setAttribute('aria-label','Close safety notice');close.textContent='×';
  const caption=document.createElement('figcaption');caption.className='craigco-safety-caption';caption.textContent='Building confidence. Keeping humans in charge.';
  panel.append(img,close,caption);dialog.append(panel);document.body.append(button,dialog);
  button.addEventListener('click',()=>{if(!dialog.open)dialog.showModal();});
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();
