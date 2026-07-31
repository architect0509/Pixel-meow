let gridWidth = 16;
    let gridHeight = 16;
    const DISPLAY_SIZE = 512;

    let currentTool = 'pencil'; 
    let currentColor = '#ffffff';
    let currentAlpha = 1.0; 
    let isDrawing = false;
    let lineStartCoords = null;
    let shapeStartCoords = null;

    let prevDrawX = null;
    let prevDrawY = null;

    let toolOptions = {
      pencilSize: 1,
      lineSize: 1,
      bucketTolerance: 0,
      eraserSize: 1,
      shapeType: 'rect',
      shapeFill: false
    };

    let panX = 0, panY = 0;
    let zoomScale = 1;
    let isPanning = false;
    let startPanX = 0, startPanY = 0;

    let selectionRect = null;
    let isSelecting = false;
    let selectStart = null;
    let isMoveDragging = false;
    let moveDragStart = null;
    let draggedData = null;
    let dragOriginPos = null;
    let clipboardBuffer = null;

    let draggedLayerIndex = null;
    let draggedFrameIndex = null;

    let historyStack = [];
    let historyIndex = -1;
    const MAX_HISTORY = 30;

    let prevFrameOpacity = 0.3;
    let nextFrameOpacity = 0.3;
    let isPlaying = false;
    let playInterval = null;

    let frames = [];
    let activeFrameIndex = -1;
    let frameIdCounter = 0;
    let layerIdCounter = 0;

    let pendingDroppedImage = null;

    // --- 이어서 작업하기 복원 및 ID 변수 ---
    let editingArtId = null;

    const logoIcon = document.getElementById('logoIcon');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const applySizeBtn = document.getElementById('applySizeBtn');

    const prevOpacityInput = document.getElementById('prevOpacityInput');
    const nextOpacityInput = document.getElementById('nextOpacityInput');
    const prevOpacityVal = document.getElementById('prevOpacityVal');
    const nextOpacityVal = document.getElementById('nextOpacityVal');
    const playBtn = document.getElementById('playBtn');
    const fpsInput = document.getElementById('fpsInput');

    const pencilBtn = document.getElementById('pencilBtn');
    const lineBtn = document.getElementById('lineBtn');
    const bucketBtn = document.getElementById('bucketBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const shapeBtn = document.getElementById('shapeBtn');
    const eyedropperBtn = document.getElementById('eyedropperBtn');
    const handToolBtn = document.getElementById('handToolBtn');
    const selectToolBtn = document.getElementById('selectToolBtn');
    const moveToolBtn = document.getElementById('moveToolBtn');

    const flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
    const flipVerticalBtn = document.getElementById('flipVerticalBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const centerAlignBtn = document.getElementById('centerAlignBtn');

    const toolRibbonTitle = document.getElementById('toolRibbonTitle');
    const toolRibbonContent = document.getElementById('toolRibbonContent');
    const colorRibbonGroup = document.getElementById('colorRibbonGroup');

    const colorPicker = document.getElementById('colorPicker');
    const alphaInput = document.getElementById('alphaInput');
    const alphaVal = document.getElementById('alphaVal');
    const palette10Steps = document.getElementById('palette10Steps');

    const canvasViewport = document.getElementById('canvasViewport');
    const canvasContainer = document.getElementById('canvasContainer');
    const gridCanvas = document.getElementById('gridCanvas');
    const gridCtx = gridCanvas.getContext('2d');
    const previewCanvas = document.getElementById('previewCanvas');
    const previewCtx = previewCanvas.getContext('2d');
    const selectionCanvas = document.getElementById('selectionCanvas');
    const selectionCtx = selectionCanvas.getContext('2d');
    const onionPrevCanvas = document.getElementById('onionPrevCanvas');
    const onionPrevCtx = onionPrevCanvas.getContext('2d');
    const onionNextCanvas = document.getElementById('onionNextCanvas');
    const onionNextCtx = onionNextCanvas.getContext('2d');

    const frameListEl = document.getElementById('frameList');
    const addFrameBtn = document.getElementById('addFrameBtn');
    const layerListEl = document.getElementById('layerList');
    const addLayerBtn = document.getElementById('addLayerBtn');

    const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const togglePostBtn = document.getElementById('togglePostBtn');
    const postPanel = document.getElementById('postPanel');

    const changelogModalBtn = document.getElementById('changelogModalBtn');
    const changelogModal = document.getElementById('changelogModal');
    const closeChangelogModal = document.getElementById('closeChangelogModal');

    const brightnessInput = document.getElementById('brightnessInput');
    const contrastInput = document.getElementById('contrastInput');
    const saturateInput = document.getElementById('saturateInput');
    const canvasOpacityInput = document.getElementById('canvasOpacityInput');
    const brightnessVal = document.getElementById('brightnessVal');
    const contrastVal = document.getElementById('contrastVal');
    const saturateVal = document.getElementById('saturateVal');
    const canvasOpacityVal = document.getElementById('canvasOpacityVal');
    const resetPostBtn = document.getElementById('resetPostBtn');

    const fileNameInput = document.getElementById('fileNameInput');
    const scaleSelect = document.getElementById('scaleSelect');
    const columnsInput = document.getElementById('columnsInput');
    const saveBtn = document.getElementById('saveBtn');
    const saveSeparateBtn = document.getElementById('saveSeparateBtn');
    const saveGifBtn = document.getElementById('saveGifBtn');

    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const loadProjectBtn = document.getElementById('loadProjectBtn');
    const projectFileInput = document.getElementById('projectFileInput');
    const shareArtBtn = document.getElementById('shareArtBtn'); 

    const bottomFramePanel = document.getElementById('bottomFramePanel');
    const toggleBottomBtn = document.getElementById('toggleBottomBtn');

    const toggleHeaderBtn = document.getElementById('toggleHeaderBtn');
    const toastMsgEl = document.getElementById('toastMsg');
    let toastTimeout = null;

    const toolbar = document.querySelector('.mini-nav-toolbar');
    const handle = document.querySelector('.drag-handle');

    let isDragging = false;
    let startX, startY;

    const goGalleryBtn = document.getElementById('goGalleryBtn');
    const openNewWindowBtn = document.getElementById('openNewWindowBtn');
    const reloadPageBtn = document.getElementById('reloadPageBtn');

    // --- 파이어베이스 기반 이어서 작업하기 복원 로직 ---
    window.addEventListener('DOMContentLoaded', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fromSession = !urlParams.get('id');
      const targetId = urlParams.get('id') || sessionStorage.getItem('edit_target_art_id') || sessionStorage.getItem('current_art_id');

      if (!targetId) return; 
      editingArtId = targetId;

      // edit_target_art_id/data는 detail.html -> canvas.html 이동 시 딱 한 번만 쓰기 위한 값.
      // 지워두지 않으면 나중에 "+ 새 작품 만들기"로 완전히 새 캔버스를 열어도
      // 이 값이 세션에 남아있어서 예전 작품을 다시 불러와버림.
      if (fromSession) {
        sessionStorage.removeItem('edit_target_art_id');
        sessionStorage.removeItem('edit_target_art_data');
        sessionStorage.removeItem('current_art_id');
        // 새로고침/새 창 버튼이 계속 같은 작품을 이어서 열 수 있도록 URL에 id를 남겨둠
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', targetId);
        window.history.replaceState({}, '', newUrl);
      }

      const checkFirebase = setInterval(async () => {
        if (window.pixelFirebase && window.pixelFirebase.db) {
          clearInterval(checkFirebase);
          try {
            showToast("기존 작품 불러오는 중...");
            const { db, doc, getDoc } = window.pixelFirebase;
            
            const docRef = doc(db, "arts", editingArtId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const artData = docSnap.data();
              
              if (artData.title && document.getElementById('fileNameInput')) {
                document.getElementById('fileNameInput').value = artData.title;
              }
              if (artData.author && document.getElementById('saveModalDescInput')) {
                document.getElementById('saveModalDescInput').value = artData.author;
              }

              if (artData.width && artData.height && typeof resizeCanvasSmart === 'function') {
                resizeCanvasSmart(artData.width, artData.height, false);
              }

              if (artData.frames && Array.isArray(artData.frames) && typeof frames !== 'undefined' && artData.frames.length > 0) {
                // 기존 프레임/레이어의 캔버스 DOM을 먼저 정리하고 배열을 비운다.
                frames.forEach(f => f.layers.forEach(l => l.canvas.remove()));
                frames = [];
                frameListEl.innerHTML = '';
                layerListEl.innerHTML = '';
                frameIdCounter = 0;
                layerIdCounter = 0;

                let loadedCount = 0;
                const totalFrames = artData.frames.length;

                artData.frames.forEach((fData) => {
                  addFrame();
                  const curF = frames[frames.length - 1];
                  curF.visible = (fData.visible !== false);
                  if (!curF.visible && curF.blockEl) curF.blockEl.classList.add('hidden-block');

                  // addFrame()이 기본으로 만들어준 빈 레이어는 제거하고, 저장된 레이어로 새로 채운다.
                  curF.layers[0].canvas.remove();
                  curF.layers = [];

                  const layerList = (fData.layers && fData.layers.length > 0) ? fData.layers : [{ name: '레이어 1', visible: true, dataUrl: null }];
                  let layerLoadedCount = 0;

                  layerList.forEach((lData) => {
                    createLayerForFrame(curF);
                    const curL = curF.layers[curF.layers.length - 1];
                    if (lData.name) curL.name = lData.name;
                    curL.visible = (lData.visible !== false);

                    const finishLayer = () => {
                      layerLoadedCount++;
                      if (typeof updateActiveLayerPreview === 'function') updateActiveLayerPreview();
                      if (layerLoadedCount === layerList.length) {
                        loadedCount++;
                        if (loadedCount === totalFrames) {
                          if (typeof selectFrame === 'function') selectFrame(0);
                          if (typeof renderCanvas === 'function') renderCanvas();
                          if (typeof updateFrameList === 'function') updateFrameList();
                          showToast('기존 작품 불러오기 완료!');
                        }
                      }
                    };

                    if (lData.dataUrl) {
                      const img = new Image();
                      img.onload = () => {
                        curL.ctx.clearRect(0, 0, gridWidth, gridHeight);
                        curL.ctx.drawImage(img, 0, 0);
                        finishLayer();
                      };
                      img.onerror = finishLayer;
                      img.src = lData.dataUrl;
                    } else {
                      finishLayer();
                    }
                  });
                });
              } else if (artData.preview && typeof frames !== 'undefined' && frames.length > 0) {
                const targetLayer = frames[0].layers[0];
                const img = new Image();
                img.onload = () => {
                  targetLayer.ctx.clearRect(0, 0, gridWidth, gridHeight);
                  targetLayer.ctx.drawImage(img, 0, 0);
                  if (typeof updateActiveLayerPreview === 'function') updateActiveLayerPreview();
                  if (typeof renderCanvas === 'function') renderCanvas();
                  showToast('기존 작품 불러오기 완료!');
                };
                img.src = artData.preview;
              } else {
                showToast('기존 작품 불러오기 완료!');
              }
            } else {
              console.warn("해당 ID의 작품을 파이어베이스에서 찾을 수 없습니다.");
            }
          } catch (err) {
            console.error("작품 불러오기 실패:", err);
          }
        }
      }, 200);
    });

    goGalleryBtn.addEventListener('click', () => {
      window.open('../index.html', '_blank');
    });

    openNewWindowBtn.addEventListener('click', () => {
      editingArtId = null;
      window.open(window.location.href, '_blank');
    });

    reloadPageBtn.addEventListener('click', () => {
      if (confirm("작업 중인 내용이 초기화될 수 있습니다. 새로고침하시겠습니까?")) {
        editingArtId = null;
        window.location.reload();
      }
    });

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - toolbar.offsetLeft;
      startY = e.clientY - toolbar.offsetTop;
      e.preventDefault();
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      let newX = e.clientX - startX;
      let newY = e.clientY - startY;
      
      const parentRect = document.querySelector('.workspace-wrapper').getBoundingClientRect();
      const toolbarRect = toolbar.getBoundingClientRect();
      
      const minX = 0;
      const minY = 0;
      const maxX = parentRect.width - toolbarRect.width;
      const maxY = parentRect.height - toolbarRect.height-30;
      
      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
      
      toolbar.style.left = `${newX}px`;
      toolbar.style.top = `${newY}px`;
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    const mainHeader = document.getElementById('mainHeader');
    toggleHeaderBtn.addEventListener('click', () => {
      mainHeader.classList.toggle('collapsed');
      toggleHeaderBtn.innerText = mainHeader.classList.contains('collapsed') ? '▼ ' : '▲ ';
    });

    togglePostBtn.addEventListener('click', () => {
      postPanel.classList.toggle('collapsed');
      togglePostBtn.classList.toggle('active', !postPanel.classList.contains('collapsed'));
      if (!settingsPanel.classList.contains('collapsed')) {
        settingsPanel.classList.add('collapsed');
        toggleSettingsBtn.classList.remove('active');
      }
    });

    toggleSettingsBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('collapsed');
      toggleSettingsBtn.classList.toggle('active', !settingsPanel.classList.contains('collapsed'));
      if (!postPanel.classList.contains('collapsed')) {
        postPanel.classList.add('collapsed');
        togglePostBtn.classList.remove('active');
      }
    });

    changelogModalBtn.addEventListener('click', () => {
      changelogModal.style.display = 'flex';
    });
    closeChangelogModal.addEventListener('click', () => {
      changelogModal.style.display = 'none';
    });

    const splitImageModal = document.getElementById('splitImageModal');
    const splitTargetWidth = document.getElementById('splitTargetWidth');
    const splitOriginalSizeInfo = document.getElementById('splitOriginalSizeInfo');
    const splitColsInput = document.getElementById('splitColsInput');
    const splitRowsInput = document.getElementById('splitRowsInput');
    const cancelSplitBtn = document.getElementById('cancelSplitBtn');
    const confirmSplitBtn = document.getElementById('confirmSplitBtn');

    cancelSplitBtn.addEventListener('click', () => {
      splitImageModal.style.display = 'none';
      pendingDroppedImage = null;
    });

    confirmSplitBtn.addEventListener('click', () => {
      if (!pendingDroppedImage) return;

      const img = pendingDroppedImage;
      const origW = img.width;
      const origH = img.height;

      const targetW = parseInt(splitTargetWidth.value) || origW;
      const ratio = origH / origW;
      const targetH = Math.round(targetW * ratio);

      const cols = Math.max(1, parseInt(splitColsInput.value) || 1);
      const rows = Math.max(1, parseInt(splitRowsInput.value) || 1);

      const sliceW = Math.floor(targetW / cols);
      const sliceH = Math.floor(targetH / rows);

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = targetW;
      fullCanvas.height = targetH;
      const fullCtx = fullCanvas.getContext('2d');
      fullCtx.imageSmoothingEnabled = false;
      fullCtx.drawImage(img, 0, 0, targetW, targetH);

      resizeCanvasSmart(sliceW, sliceH, true);

      frames.forEach(f => f.layers.forEach(l => l.canvas.remove()));
      frames = [];
      frameListEl.innerHTML = '';
      layerListEl.innerHTML = '';
      frameIdCounter = 0;
      layerIdCounter = 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          addFrame();
          const curF = frames[frames.length - 1];
          const ctx = curF.layers[0].ctx;

          ctx.clearRect(0, 0, sliceW, sliceH);
          ctx.drawImage(
            fullCanvas,
            c * sliceW, r * sliceH, sliceW, sliceH,
            0, 0, sliceW, sliceH
          );
          updateFramePreview(curF);
        }
      }

      selectFrame(0);
      splitImageModal.style.display = 'none';
      pendingDroppedImage = null;
      showToast(`이미지 분할 완료 (${cols}x${rows} 프레임 생성됨)`);
    });

    const previewModalBtn = document.getElementById('previewModalBtn');
    const previewModal = document.getElementById('previewModal');
    const closePreviewModal = document.getElementById('closePreviewModal');
    const previewModalCanvas = document.getElementById('previewModalCanvas');
    const modalCanvasWrapper = document.getElementById('modalCanvasWrapper');
    const modalBgWhite = document.getElementById('modalBgWhite');
    const modalBgBlack = document.getElementById('modalBgBlack');
    const modalBgGray = document.getElementById('modalBgGray');
    const modalBgFile = document.getElementById('modalBgFile');
    const modalBgClear = document.getElementById('modalBgClear');

    let modalAnimInterval = null;

    previewModalBtn.addEventListener('click', () => {
      if (frames.length === 0) return;
      previewModal.style.display = 'flex';

      previewModalCanvas.width = gridWidth * 16;
      previewModalCanvas.height = gridHeight * 16;
      const mCtx = previewModalCanvas.getContext('2d');
      mCtx.imageSmoothingEnabled = false;

      let fIdx = 0;
      const fps = parseInt(fpsInput.value) || 6;

      if (modalAnimInterval) clearInterval(modalAnimInterval);

      modalAnimInterval = setInterval(() => {
        const curF = frames[fIdx];
        mCtx.clearRect(0, 0, previewModalCanvas.width, previewModalCanvas.height);

        const tempC = document.createElement('canvas');
        tempC.width = gridWidth;
        tempC.height = gridHeight;
        const tempCtx = tempC.getContext('2d');
        curF.layers.forEach(l => { if (l.visible) tempCtx.drawImage(l.canvas, 0, 0); });

        mCtx.filter = `brightness(${brightnessInput.value}%) contrast(${contrastInput.value}%) saturate(${saturateInput.value}%) opacity(${canvasOpacityInput.value}%)`;
        mCtx.drawImage(tempC, 0, 0, previewModalCanvas.width, previewModalCanvas.height);

        fIdx = (fIdx + 1) % frames.length;
      }, 1000 / fps);
    });

    closePreviewModal.addEventListener('click', () => {
      previewModal.style.display = 'none';
      if (modalAnimInterval) clearInterval(modalAnimInterval);
    });

    modalBgWhite.addEventListener('click', () => {
      modalCanvasWrapper.style.backgroundColor = '#ffffff';
      modalCanvasWrapper.style.backgroundImage = 'none';
    });
    modalBgBlack.addEventListener('click', () => {
      modalCanvasWrapper.style.backgroundColor = '#000000';
      modalCanvasWrapper.style.backgroundImage = 'none';
    });
    modalBgGray.addEventListener('click', () => {
      modalCanvasWrapper.style.backgroundColor = '#777777';
      modalCanvasWrapper.style.backgroundImage = 'none';
    });
    modalBgClear.addEventListener('click', () => {
      modalCanvasWrapper.style.backgroundColor = '#ffffff';
      modalCanvasWrapper.style.backgroundImage = 'none';
    });

    modalBgFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          modalCanvasWrapper.style.backgroundImage = `url('${event.target.result}')`;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });

    logoIcon.addEventListener('click', () => {
      if (confirm("작업 중인 내용이 초기화될 수 있습니다. 새로고침하시겠습니까?")) {
        editingArtId = null;
        window.location.reload();
      }
    });

    resetPostBtn.addEventListener('click', () => {
      brightnessInput.value = 100;
      contrastInput.value = 100;
      saturateInput.value = 100;
      canvasOpacityInput.value = 100;
      updateCanvasFilters();
      showToast('후처리가 초기화되었습니다.');
    });

    function showToast(msg) {
      if (!toastMsgEl) return;
      toastMsgEl.innerText = msg;
      toastMsgEl.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toastMsgEl.classList.remove('show');
      }, 1200);
    }

    toggleBottomBtn.addEventListener('click', () => {
      bottomFramePanel.classList.toggle('collapsed');
      toggleBottomBtn.innerText = bottomFramePanel.classList.contains('collapsed') ? '▲' : '▼';
    });

    function setupUnityStyleDragLabels() {
      document.querySelectorAll('.drag-label').forEach(label => {
        const targetId = label.getAttribute('for');
        const input = targetId ? document.getElementById(targetId) : label.nextElementSibling;

        if (!input || input.type !== 'number') return;

        let isDragging = false;
        let startX = 0;
        let startVal = 0;

        label.addEventListener('pointerdown', (e) => {
          isDragging = true;
          startX = e.clientX;
          startVal = parseFloat(input.value) || 0;
          label.setPointerCapture(e.pointerId);
        });

        label.addEventListener('pointermove', (e) => {
          if (!isDragging) return;

          const deltaX = e.clientX - startX;
          const sensitivity = 0.5;
          let newVal = Math.round(startVal + (deltaX * sensitivity));

          const min = input.min !== '' ? parseFloat(input.min) : -Infinity;
          const max = input.max !== '' ? parseFloat(input.max) : Infinity;
          newVal = Math.max(min, Math.min(max, newVal));

          if (input.value != newVal) {
            input.value = newVal;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });

        const stopDrag = (e) => {
          if (!isDragging) return;
          isDragging = false;
          try { label.releasePointerCapture(e.pointerId); } catch(err) {}
        };

        label.addEventListener('pointerup', stopDrag);
        label.addEventListener('pointercancel', stopDrag);
      });
    }

    function saveHistory() {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];
      const activeLayer = curFrame.layers[curFrame.activeLayerIndex];
      if (!activeLayer) return;

      const imgData = activeLayer.ctx.getImageData(0, 0, gridWidth, gridHeight);
      historyStack = historyStack.slice(0, historyIndex + 1);
      historyStack.push({
        width: gridWidth,
        height: gridHeight,
        frameIdx: activeFrameIndex,
        layerIdx: curFrame.activeLayerIndex,
        data: imgData
      });

      if (historyStack.length > MAX_HISTORY) historyStack.shift();
      else historyIndex++;
    }

    function applyState(state) {
      if (gridWidth !== state.width || gridHeight !== state.height) {
        gridWidth = state.width;
        gridHeight = state.height;
        widthInput.value = gridWidth;
        heightInput.value = gridHeight;

        updateContainerDimensions();
        drawGrid();

        frames.forEach(f => {
          f.layers.forEach(l => {
            l.canvas.width = gridWidth;
            l.canvas.height = gridHeight;
            const aspectRatio = gridHeight / gridWidth;
            l.canvas.style.width = `${DISPLAY_SIZE}px`;
            l.canvas.style.height = `${DISPLAY_SIZE * aspectRatio}px`;
          });
        });
      }

      if (state.frameIdx !== activeFrameIndex) {
        selectFrame(state.frameIdx);
      }
      if (state.layerIdx !== frames[activeFrameIndex].activeLayerIndex) {
        selectLayer(state.layerIdx);
      }

      const curFrame = frames[state.frameIdx];
      if (curFrame && curFrame.layers[state.layerIdx]) {
        curFrame.layers[state.layerIdx].ctx.putImageData(state.data, 0, 0);
        updateActiveLayerPreview();
      }
    }

    function undo() {
      if (historyIndex < 0) {
        showToast('더 이상 되돌릴 수 없습니다.');
        return;
      }
      const state = historyStack[historyIndex];
      historyIndex--;
      applyState(state);
      showToast(`되돌리기 완료 (남은 되돌리기: ${historyIndex + 1}회)`);
    }

    function redo() {
      if (historyIndex >= historyStack.length - 1) {
        showToast('더 이상 다시 실행할 수 없습니다.');
        return;
      }
      historyIndex++;
      const state = historyStack[historyIndex];
      applyState(state);
      showToast(`다시 실행 완료 (남은 다시 실행: ${historyStack.length - 1 - historyIndex}회)`);
    }

    function resizeCanvasSmart(newW, newH, autoFit = false) {
      newW = newW || parseInt(widthInput.value) || 16;
      newH = newH || parseInt(heightInput.value) || 16;

      if (newW === gridWidth && newH === gridHeight && !autoFit) return;

      saveHistory();

      const oldW = gridWidth;
      const oldH = gridHeight;

      gridWidth = newW;
      gridHeight = newH;
      widthInput.value = newW;
      heightInput.value = newH;

      updateContainerDimensions();
      drawGrid();

      if (autoFit) {
        const viewportW = canvasViewport.clientWidth || 800;
        const viewportH = canvasViewport.clientHeight || 600;
        const scaleX = (viewportW * 0.8) / DISPLAY_SIZE;
        const scaleY = (viewportW * (gridHeight / gridWidth)) > (viewportH * 0.8) ? (viewportH * 0.8) / (DISPLAY_SIZE * (gridHeight / gridWidth)) : 1;
        zoomScale = Math.min(scaleX, scaleY, 1);
        panX = 0;
        panY = 0;
        updateTransform();
      }

      frames.forEach(f => {
        f.layers.forEach(l => {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = oldW;
          tempCanvas.height = oldH;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(l.canvas, 0, 0);

          l.canvas.width = newW;
          l.canvas.height = newH;
          const aspectRatio = newH / newW;
          l.canvas.style.width = `${DISPLAY_SIZE}px`;
          l.canvas.style.height = `${DISPLAY_SIZE * aspectRatio}px`;

          l.ctx.drawImage(tempCanvas, 0, 0);
        });
        updateFramePreview(f);
      });

      renderLayerUI();
      updateOnionSkin();
    }

    applySizeBtn.addEventListener('click', () => resizeCanvasSmart());

    flipHorizontalBtn.addEventListener('click', () => {
      if (activeFrameIndex === -1) return;
      saveHistory();
      const ctx = frames[activeFrameIndex].layers[frames[activeFrameIndex].activeLayerIndex].ctx;

      if (selectionRect) {
        const imgData = ctx.getImageData(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        const tempC = document.createElement('canvas');
        tempC.width = selectionRect.w; tempC.height = selectionRect.h;
        tempC.getContext('2d').putImageData(imgData, 0, 0);
        ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        ctx.save();
        ctx.translate(selectionRect.x + selectionRect.w, selectionRect.y);
        ctx.scale(-1, 1);
        ctx.drawImage(tempC, 0, 0);
        ctx.restore();
      } else {
        const tempC = document.createElement('canvas');
        tempC.width = gridWidth; tempC.height = gridHeight;
        tempC.getContext('2d').drawImage(frames[activeFrameIndex].layers[frames[activeFrameIndex].activeLayerIndex].canvas, 0, 0);
        ctx.clearRect(0, 0, gridWidth, gridHeight);
        ctx.save();
        ctx.translate(gridWidth, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(tempC, 0, 0);
        ctx.restore();
      }
      updateActiveLayerPreview();
    });

    flipVerticalBtn.addEventListener('click', () => {
      if (activeFrameIndex === -1) return;
      saveHistory();
      const ctx = frames[activeFrameIndex].layers[frames[activeFrameIndex].activeLayerIndex].ctx;

      if (selectionRect) {
        const imgData = ctx.getImageData(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        const tempC = document.createElement('canvas');
        tempC.width = selectionRect.w; tempC.height = selectionRect.h;
        tempC.getContext('2d').putImageData(imgData, 0, 0);
        ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        ctx.save();
        ctx.translate(selectionRect.x, selectionRect.y + selectionRect.h);
        ctx.scale(1, -1);
        ctx.drawImage(tempC, 0, 0);
        ctx.restore();
      } else {
        const tempC = document.createElement('canvas');
        tempC.width = gridWidth; tempC.height = gridHeight;
        tempC.getContext('2d').drawImage(frames[activeFrameIndex].layers[frames[activeFrameIndex].activeLayerIndex].canvas, 0, 0);
        ctx.clearRect(0, 0, gridWidth, gridHeight);
        ctx.save();
        ctx.translate(0, gridHeight);
        ctx.scale(1, -1);
        ctx.drawImage(tempC, 0, 0);
        ctx.restore();
      }
      updateActiveLayerPreview();
    });

    rotateBtn.addEventListener('click', () => {
      if (activeFrameIndex === -1) return;
      saveHistory();
      const curLayer = frames[activeFrameIndex].layers[frames[activeFrameIndex].activeLayerIndex];
      const ctx = curLayer.ctx;

      if (selectionRect) {
        const imgData = ctx.getImageData(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        const tempC = document.createElement('canvas');
        tempC.width = selectionRect.w; tempC.height = selectionRect.h;
        tempC.getContext('2d').putImageData(imgData, 0, 0);

        ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        ctx.save();
        ctx.translate(selectionRect.x + selectionRect.h, selectionRect.y);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(tempC, 0, 0);
        ctx.restore();
      } else {
        const tempC = document.createElement('canvas');
        tempC.width = gridWidth; tempC.height = gridHeight;
        tempC.getContext('2d').drawImage(curLayer.canvas, 0, 0);

        ctx.clearRect(0, 0, gridWidth, gridHeight);
        ctx.save();
        ctx.translate(gridWidth, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(tempC, 0, 0);
        ctx.restore();
      }
      updateActiveLayerPreview();
    });

    centerAlignBtn.addEventListener('click', () => {
      if (activeFrameIndex === -1) return;
      saveHistory();

      const ctx = frames[activeFrameIndex].layers[frames[activeFrameIndex].activeLayerIndex].ctx;
      const imgData = ctx.getImageData(0, 0, gridWidth, gridHeight);
      const data = imgData.data;

      let minX = gridWidth, minY = gridHeight, maxX = -1, maxY = -1;

      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const alpha = data[(y * gridWidth + x) * 4 + 3];
          if (alpha > 0) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX === -1) return;

      const contentW = maxX - minX + 1;
      const contentH = maxY - minY + 1;

      const targetX = Math.floor((gridWidth - contentW) / 2);
      const targetY = Math.floor((gridHeight - contentH) / 2);

      const contentData = ctx.getImageData(minX, minY, contentW, contentH);
      const tempC = document.createElement('canvas');
      tempC.width = contentW;
      tempC.height = contentH;
      tempC.getContext('2d').putImageData(contentData, 0, 0);

      ctx.clearRect(0, 0, gridWidth, gridHeight);
      ctx.drawImage(tempC, targetX, targetY);

      if (selectionRect) {
        selectionRect.x = targetX;
        selectionRect.y = targetY;
        selectionRect.w = contentW;
        selectionRect.h = contentH;
        drawSelectionOverlay();
      }

      updateActiveLayerPreview();
    });

    function updateToolRibbon() {
      toolRibbonContent.innerHTML = '';
      
      const drawingTools = ['pencil', 'line', 'bucket', 'shape', 'eyedropper'];
      if (drawingTools.includes(currentTool)) {
        colorRibbonGroup.style.display = 'flex';
      } else {
        colorRibbonGroup.style.display = 'none';
      }

      if (currentTool === 'pencil') {
        toolRibbonTitle.innerText = '연필 옵션';
        toolRibbonContent.innerHTML = `
          <label class="drag-label" for="pencilSizeInput">두께:</label>
          <input type="number" id="pencilSizeInput" value="${toolOptions.pencilSize}" min="1" max="10">
        `;
        document.getElementById('pencilSizeInput').addEventListener('change', (e) => {
          toolOptions.pencilSize = parseInt(e.target.value) || 1;
        });
      } else if (currentTool === 'line') {
        toolRibbonTitle.innerText = '직선 옵션';
        toolRibbonContent.innerHTML = `
          <label class="drag-label" for="lineSizeInput">두께:</label>
          <input type="number" id="lineSizeInput" value="${toolOptions.lineSize}" min="1" max="10">
        `;
        document.getElementById('lineSizeInput').addEventListener('change', (e) => {
          toolOptions.lineSize = parseInt(e.target.value) || 1;
        });
      } else if (currentTool === 'bucket') {
        toolRibbonTitle.innerText = '채우기 옵션';
        toolRibbonContent.innerHTML = `
          <label class="drag-label" for="bucketTolInput">허용 오차:</label>
          <input type="number" id="bucketTolInput" value="${toolOptions.bucketTolerance}" min="0" max="100">
        `;
        document.getElementById('bucketTolInput').addEventListener('change', (e) => {
          toolOptions.bucketTolerance = parseInt(e.target.value) || 0;
        });
      } else if (currentTool === 'eraser') {
        toolRibbonTitle.innerText = '지우개 옵션';
        toolRibbonContent.innerHTML = `
          <label class="drag-label" for="eraserSizeInput">크기:</label>
          <input type="number" id="eraserSizeInput" value="${toolOptions.eraserSize}" min="1" max="10">
        `;
        document.getElementById('eraserSizeInput').addEventListener('change', (e) => {
          toolOptions.eraserSize = parseInt(e.target.value) || 1;
        });
      } else if (currentTool === 'shape') {
        toolRibbonTitle.innerText = '도형 옵션';
        toolRibbonContent.innerHTML = `
          <label>모양:</label>
          <select id="shapeTypeSelect">
            <option value="rect" ${toolOptions.shapeType === 'rect' ? 'selected' : ''}>직사각형</option>
            <option value="circle" ${toolOptions.shapeType === 'circle' ? 'selected' : ''}>원 / 타원</option>
          </select>
          <label style="margin-left:6px;">채우기:</label>
          <input type="checkbox" id="shapeFillCheck" ${toolOptions.shapeFill ? 'checked' : ''}>
        `;
        document.getElementById('shapeTypeSelect').addEventListener('change', (e) => {
          toolOptions.shapeType = e.target.value;
        });
        document.getElementById('shapeFillCheck').addEventListener('change', (e) => {
          toolOptions.shapeFill = e.target.checked;
        });
      } else if (currentTool === 'eyedropper') {
        toolRibbonTitle.innerText = '스포이드 옵션';
        toolRibbonContent.innerHTML = `<span style="color:#aaa;">픽셀을 클릭하여 색상을 추출하세요</span>`;
      } else {
        toolRibbonTitle.innerText = '탐색/이동 옵션';
        if (selectionRect) {
          toolRibbonContent.innerHTML = `<button id="headerClearSelectionBtn" style="background:#d9534f; border-color:#d43f3a; color:#fff; padding:3px 10px; border-radius:3px; cursor:pointer;">선택 취소</button>`;
          document.getElementById('headerClearSelectionBtn').addEventListener('click', () => {
            clearSelection();
          });
        } else {
          toolRibbonContent.innerHTML = `<span style="color:#aaa;">선택된 영역 없음</span>`;
        }
      }
      setupUnityStyleDragLabels();
    }

    function initEditor() {
      gridWidth = parseInt(widthInput.value) || 16;
      gridHeight = parseInt(heightInput.value) || 16;

      updateContainerDimensions();

      frames = [];
      frameListEl.innerHTML = '';
      layerListEl.innerHTML = '';
      frameIdCounter = 0;
      layerIdCounter = 0;

      historyStack = [];
      historyIndex = -1;

      drawGrid();
      addFrame();
      generate10Shades(currentColor);
      updateToolRibbon();
      setupUnityStyleDragLabels();
    }

    function updateContainerDimensions() {
      const aspectRatio = gridHeight / gridWidth;
      const displayHeight = DISPLAY_SIZE * aspectRatio;

      canvasContainer.style.width = `${DISPLAY_SIZE}px`;
      canvasContainer.style.height = `${displayHeight}px`;

      [gridCanvas, previewCanvas, selectionCanvas, onionPrevCanvas, onionNextCanvas].forEach(c => {
        c.width = gridWidth;
        c.height = gridHeight;
        c.style.width = `${DISPLAY_SIZE}px`;
        c.style.height = `${displayHeight}px`;
      });

      updateTransform();
    }

    function updateTransform() {
      canvasContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
      drawSelectionOverlay();
    }

    function drawGrid() {
      gridCtx.clearRect(0, 0, gridWidth, gridHeight);
      gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      gridCtx.lineWidth = 0.05;

      for (let x = 0; x <= gridWidth; x++) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridHeight);
        gridCtx.stroke();
      }
      for (let y = 0; y <= gridHeight; y++) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridWidth, y);
        gridCtx.stroke();
      }
    }

    function addFrame() {
      const frameId = ++frameIdCounter;
      const frameObj = {
        id: frameId,
        visible: true,
        layers: [],
        activeLayerIndex: -1,
        blockEl: null,
        imgPreviewEl: null
      };

      const block = document.createElement('div');
      block.className = 'manage-block';
      block.setAttribute('draggable', 'true');

      const imgPreview = document.createElement('img');
      imgPreview.className = 'block-preview';

      const btnDel = document.createElement('div');
      btnDel.className = 'block-btn btn-delete';
      btnDel.innerText = '×';
      btnDel.addEventListener('pointerdown', (e) => { 
        e.stopPropagation(); 
        e.preventDefault();
        deleteFrame(frameId); 
      });

      const btnVis = document.createElement('div');
      btnVis.className = 'block-btn btn-toggle-vis';
      btnVis.innerText = '👁';
      btnVis.addEventListener('pointerdown', (e) => { 
        e.stopPropagation(); 
        e.preventDefault();
        toggleFrameVisibility(frameId); 
      });

      const numberTag = document.createElement('div');
      numberTag.className = 'block-number';

      block.appendChild(imgPreview);
      block.appendChild(btnDel);
      block.appendChild(btnVis);
      block.appendChild(numberTag);

      frameObj.blockEl = block;
      frameObj.imgPreviewEl = imgPreview;

      frames.push(frameObj);

      block.addEventListener('dragstart', (e) => {
        draggedFrameIndex = frames.indexOf(frameObj);
        block.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      block.addEventListener('dragend', () => {
        block.classList.remove('dragging');
        document.querySelectorAll('#frameList .manage-block').forEach(b => b.classList.remove('drag-over'));
      });

      block.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        block.classList.add('drag-over');
      });

      block.addEventListener('dragleave', () => {
        block.classList.remove('drag-over');
      });

      block.addEventListener('drop', (e) => {
        e.preventDefault();
        block.classList.remove('drag-over');
        const targetIndex = frames.indexOf(frameObj);

        if (draggedFrameIndex !== null && draggedFrameIndex !== targetIndex) {
          const movedFrame = frames.splice(draggedFrameIndex, 1)[0];
          frames.splice(targetIndex, 0, movedFrame);

          draggedFrameIndex = null;
          renderFrameUI();
          selectFrame(targetIndex);
        }
      });

      block.addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains('block-btn')) return;
        selectFrame(frames.indexOf(frameObj));
      });

      createLayerForFrame(frameObj);
      renderFrameUI();
      selectFrame(frames.length - 1);
    }

    function renderFrameUI() {
      frameListEl.innerHTML = '';
      frames.forEach((f) => {
        frameListEl.appendChild(f.blockEl);
      });
      updateFrameNumbers();
    }

    function deleteFrame(frameId) {
      if (frames.length <= 1) return;
      const index = frames.findIndex(f => f.id === frameId);
      if (index === -1) return;

      const targetFrame = frames[index];
      targetFrame.layers.forEach(l => l.canvas.remove());
      targetFrame.blockEl.remove();

      frames.splice(index, 1);
      renderFrameUI();

      const newIndex = Math.min(index, frames.length - 1);
      selectFrame(newIndex);
    }

    function toggleFrameVisibility(frameId) {
      const frame = frames.find(f => f.id === frameId);
      if (!frame) return;

      frame.visible = !frame.visible;
      frame.blockEl.classList.toggle('hidden-block', !frame.visible);

      if (frames.indexOf(frame) === activeFrameIndex) {
        frame.layers.forEach(l => {
          l.canvas.style.display = (frame.visible && l.visible) ? 'block' : 'none';
        });
      }
      updateOnionSkin();
    }

    function selectFrame(index) {
      if (index < 0 || index >= frames.length) return;

      if (activeFrameIndex !== -1 && frames[activeFrameIndex]) {
        frames[activeFrameIndex].layers.forEach(l => l.canvas.style.display = 'none');
      }

      activeFrameIndex = index;
      const curFrame = frames[activeFrameIndex];

      frames.forEach((f, idx) => {
        if (idx === index) f.blockEl.classList.add('active');
        else f.blockEl.classList.remove('active');
      });

      curFrame.layers.forEach(l => {
        l.canvas.style.display = (curFrame.visible && l.visible) ? 'block' : 'none';
      });

      renderLayerUI();
      updateOnionSkin();
    }

    function createLayerForFrame(frameObj) {
      const layerId = ++layerIdCounter;
      const defaultName = `레이어 ${layerId}`;

      const c = document.createElement('canvas');
      c.className = 'render-canvas';
      c.width = gridWidth;
      c.height = gridHeight;

      const aspectRatio = gridHeight / gridWidth;
      c.style.width = `${DISPLAY_SIZE}px`;
      c.style.height = `${DISPLAY_SIZE * aspectRatio}px`;

      canvasContainer.insertBefore(c, previewCanvas);

      const ctx = c.getContext('2d', { willReadFrequently: true });
      const layerObj = { 
        id: layerId, 
        name: defaultName,
        visible: true, 
        canvas: c, 
        ctx: ctx, 
        blockEl: null, 
        imgPreviewEl: null 
      };

      frameObj.layers.push(layerObj);
      frameObj.activeLayerIndex = frameObj.layers.length - 1;

      updateFramePreview(frameObj);
    }

    function addLayer() {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];
      createLayerForFrame(curFrame);
      renderLayerUI();
      selectLayer(curFrame.layers.length - 1);
    }

    function deleteLayer(layerId) {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];
      if (curFrame.layers.length <= 1) return;

      const index = curFrame.layers.findIndex(l => l.id === layerId);
      if (index === -1) return;

      curFrame.layers[index].canvas.remove();
      curFrame.layers.splice(index, 1);

      const newIndex = Math.min(index, curFrame.layers.length - 1);
      renderLayerUI();
      selectLayer(newIndex);
      updateFramePreview(curFrame);
    }

    function toggleLayerVisibility(layerId) {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];
      const layer = curFrame.layers.find(l => l.id === layerId);
      if (!layer) return;

      layer.visible = !layer.visible;
      layer.canvas.style.display = (curFrame.visible && layer.visible) ? 'block' : 'none';

      renderLayerUI();
      updateFramePreview(curFrame);
    }

    function renameLayer(layerObj) {
      const newName = prompt("변경할 레이어 이름을 입력하세요:", layerObj.name);
      if (newName !== null && newName.trim() !== '') {
        layerObj.name = newName.trim();
        renderLayerUI();
      }
    }

    function syncCanvasDOMOrder() {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];

      curFrame.layers.forEach((l) => {
        canvasContainer.insertBefore(l.canvas, previewCanvas);
      });
    }

    function renderLayerUI() {
      layerListEl.innerHTML = '';
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];

      syncCanvasDOMOrder();

      [...curFrame.layers].reverse().forEach(l => {
        const realIndex = curFrame.layers.indexOf(l);

        const block = document.createElement('div');
        block.className = 'manage-block' + (realIndex === curFrame.activeLayerIndex ? ' active' : '') + (!l.visible ? ' hidden-block' : '');
        block.title = `${l.name} (드래그하여 순서 변경, 더블클릭하여 이름 변경)`;
        block.setAttribute('draggable', 'true');
        block.dataset.layerIndex = realIndex;

        const imgPreview = document.createElement('img');
        imgPreview.className = 'block-preview';
        imgPreview.src = l.canvas.toDataURL();

        const nameTag = document.createElement('div');
        nameTag.className = 'layer-name-tag';
        nameTag.innerText = l.name;

        const btnDel = document.createElement('div');
        btnDel.className = 'block-btn btn-delete';
        btnDel.innerText = '×';
        btnDel.title = '레이어 삭제';
        btnDel.addEventListener('pointerdown', (e) => { 
          e.stopPropagation(); 
          e.preventDefault();
          deleteLayer(l.id); 
        });

        const btnVis = document.createElement('div');
        btnVis.className = 'block-btn btn-toggle-vis';
        btnVis.innerText = '👁';
        btnVis.title = '숨기기/보이기';
        btnVis.addEventListener('pointerdown', (e) => { 
          e.stopPropagation(); 
          e.preventDefault();
          toggleLayerVisibility(l.id); 
        });

        const btnEditLayer = document.createElement('div');
        btnEditLayer.className = 'block-btn btn-rename';
        btnEditLayer.innerText = '⚙️';
        btnEditLayer.title = '레이어 설정 수정';
        btnEditLayer.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          openLayerEditModal(l);
        });

        block.appendChild(imgPreview);
        block.appendChild(nameTag);
        block.appendChild(btnDel);
        block.appendChild(btnVis);
        block.appendChild(btnEditLayer);

        l.blockEl = block;
        l.imgPreviewEl = imgPreview;

        block.addEventListener('dragstart', (e) => {
          draggedLayerIndex = realIndex;
          block.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        block.addEventListener('dragend', () => {
          block.classList.remove('dragging');
          document.querySelectorAll('.block-list .manage-block').forEach(b => b.classList.remove('drag-over'));
        });

        block.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          block.classList.add('drag-over');
        });

        block.addEventListener('dragleave', () => {
          block.classList.remove('drag-over');
        });

        block.addEventListener('drop', (e) => {
          e.preventDefault();
          block.classList.remove('drag-over');
          const targetIndex = parseInt(block.dataset.layerIndex);

          if (draggedLayerIndex !== null && draggedLayerIndex !== targetIndex) {
            const movedLayer = curFrame.layers.splice(draggedLayerIndex, 1)[0];
            curFrame.layers.splice(targetIndex, 0, movedLayer);

            curFrame.activeLayerIndex = targetIndex;
            draggedLayerIndex = null;

            renderLayerUI();
            selectLayer(targetIndex);
            updateFramePreview(curFrame);
          }
        });

        block.addEventListener('pointerdown', (e) => {
          if (e.target.classList.contains('block-btn')) return;
          selectLayer(realIndex);
        });

        block.addEventListener('dblclick', () => renameLayer(l));

        layerListEl.appendChild(block);
      });
    }

    function selectLayer(index) {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];
      if (index < 0 || index >= curFrame.layers.length) return;

      curFrame.activeLayerIndex = index;

      curFrame.layers.forEach((l, idx) => {
        if (l.blockEl) {
          if (idx === index) l.blockEl.classList.add('active');
          else l.blockEl.classList.remove('active');
        }
        l.canvas.style.pointerEvents = (idx === index) ? 'auto' : 'none';
      });
    }

    function updateActiveLayerPreview() {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];
      const activeLayer = curFrame.layers[curFrame.activeLayerIndex];
      if (activeLayer && activeLayer.imgPreviewEl) {
        activeLayer.imgPreviewEl.src = activeLayer.canvas.toDataURL();
      }
      updateFramePreview(curFrame);
      updateOnionSkin();
    }

    function updateFramePreview(frame) {
      if (!frame) return;
      const tempC = document.createElement('canvas');
      tempC.width = gridWidth;
      tempC.height = gridHeight;
      const tempCtx = tempC.getContext('2d');

      frame.layers.forEach(l => { if (l.visible) tempCtx.drawImage(l.canvas, 0, 0); });
      frame.imgPreviewEl.src = tempC.toDataURL();
    }

    function updateFrameNumbers() {
      frames.forEach((f, idx) => {
        const tag = f.blockEl.querySelector('.block-number');
        if (tag) tag.innerText = `${idx + 1}`;
      });
    }

    function updateOnionSkin() {
      onionPrevCtx.clearRect(0, 0, gridWidth, gridHeight);
      onionNextCtx.clearRect(0, 0, gridWidth, gridHeight);

      if (isPlaying) {
        onionPrevCanvas.style.opacity = 0;
        onionNextCanvas.style.opacity = 0;
        return;
      }

      onionPrevCanvas.style.opacity = prevFrameOpacity;
      onionNextCanvas.style.opacity = nextFrameOpacity;

      if (activeFrameIndex > 0 && prevFrameOpacity > 0) {
        const prevFrame = frames[activeFrameIndex - 1];
        if (prevFrame.visible) {
          prevFrame.layers.forEach(l => { if (l.visible) onionPrevCtx.drawImage(l.canvas, 0, 0); });
        }
      }

      if (activeFrameIndex < frames.length - 1 && nextFrameOpacity > 0) {
        const nextFrame = frames[activeFrameIndex + 1];
        if (nextFrame.visible) {
          nextFrame.layers.forEach(l => { if (l.visible) onionNextCtx.drawImage(l.canvas, 0, 0); });
        }
      }
    }

    function generate10Shades(hexColor) {
      palette10Steps.innerHTML = '';

      let r = parseInt(hexColor.slice(1, 3), 16) / 255;
      let g = parseInt(hexColor.slice(3, 5), 16) / 255;
      let b = parseInt(hexColor.slice(5, 7), 16) / 255;

      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      for (let i = 0; i < 10; i++) {
        let lStep = 0.9 - (i * 0.08);
        let shadeHex = hslToHex(h * 360, s * 100, lStep * 100);

        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        swatch.style.backgroundColor = shadeHex;
        swatch.title = shadeHex;
        swatch.addEventListener('click', () => {
          currentColor = shadeHex;
          colorPicker.value = currentColor;
          generate10Shades(currentColor);
        });

        palette10Steps.appendChild(swatch);
      }
    }

    function hslToHex(h, s, l) {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }

    function getCoords(e) {
      const rect = gridCanvas.getBoundingClientRect();
      const scaleX = gridWidth / rect.width;
      const scaleY = gridHeight / rect.height;

      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      return { x, y };
    }

    function clearSelection() {
      selectionRect = null;
      drawSelectionOverlay();
      updateToolRibbon();
    }

    function drawSelectionOverlay() {
      selectionCtx.clearRect(0, 0, gridWidth, gridHeight);
      if (!selectionRect) return;

      selectionCtx.strokeStyle = '#e9bd0c';
      selectionCtx.lineWidth = 0.15;
      selectionCtx.setLineDash([0.5, 0.5]);
      selectionCtx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);

      selectionCtx.fillStyle = 'rgba(233, 189, 12, 0.15)';
      selectionCtx.fillRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
    }

    function getShapePixels(x0, y0, x1, y1, type, fill) {
      const pixels = [];
      const minX = Math.min(x0, x1);
      const maxX = Math.max(x0, x1);
      const minY = Math.min(y0, y1);
      const maxY = Math.max(y0, y1);

      if (type === 'rect') {
        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            if (fill || x === minX || x === maxX || y === minY || y === maxY) {
              pixels.push({ x, y });
            }
          }
        }
      } else if (type === 'circle') {
        const rx = (maxX - minX) / 2;
        const ry = (maxY - minY) / 2;
        const cx = minX + rx;
        const cy = minY + ry;

        const a = rx || 0.5;
        const b = ry || 0.5;

        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            const dx = (x + 0.5 - cx);
            const dy = (y + 0.5 - cy);

            if (fill) {
              const val = (dx * dx) / (a * a) + (dy * dy) / (b * b);
              if (val <= 1.0) pixels.push({ x, y });
            } else {
              const dist1 = Math.abs((dx * dx) / (a * a) + (dy * dy) / (b * b) - 1.0);
              const inside = (dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1.0;
              
              let isBoundary = false;
              if (inside) {
                const checkSteps = [[1,0], [-1,0], [0,1], [0,-1]];
                for (let step of checkSteps) {
                  let ndx = dx + step[0];
                  let ndy = dy + step[1];
                  if ((ndx * ndx) / (a * a) + (ndy * ndy) / (b * b) > 1.0) {
                    isBoundary = true;
                    break;
                  }
                }
              }
              if (isBoundary || (dist1 < 0.35 && inside)) {
                pixels.push({ x, y });
              }
            }
          }
        }
      }
      return pixels;
    }

    function pickColor(x, y) {
      if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return;
      if (activeFrameIndex === -1) return;

      const curFrame = frames[activeFrameIndex];
      const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;
      const pixel = ctx.getImageData(x, y, 1, 1).data;

      if (pixel[3] > 0) {
        const hex = "#" + [pixel[0], pixel[1], pixel[2]].map(c => c.toString(16).padStart(2, '0')).join('');
        currentColor = hex;
        colorPicker.value = currentColor;
        generate10Shades(currentColor);
      }
    }

    function drawLineSegment(x0, y0, x1, y1) {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];
      const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;

      const sz = (currentTool === 'eraser') ? toolOptions.eraserSize : ((currentTool === 'pencil') ? toolOptions.pencilSize : 1);
      const offset = Math.floor((sz - 1) / 2);

      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = (x0 < x1) ? 1 : -1;
      const sy = (y0 < y1) ? 1 : -1;
      let err = dx - dy;

      while (true) {
        if (x0 >= 0 && x0 < gridWidth && y0 >= 0 && y0 < gridHeight) {
          if (currentTool === 'pencil') {
            ctx.globalAlpha = currentAlpha;
            ctx.fillStyle = currentColor;
            ctx.fillRect(x0 - offset, y0 - offset, sz, sz);
            ctx.globalAlpha = 1.0;
          } else if (currentTool === 'eraser') {
            ctx.clearRect(x0 - offset, y0 - offset, sz, sz);
          }
        }

        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
    }

    canvasViewport.addEventListener('pointerdown', (e) => {
      canvasViewport.setPointerCapture(e.pointerId);

      const containerRect = canvasContainer.getBoundingClientRect();
      const isOutsideCanvas = (
        e.clientX < containerRect.left ||
        e.clientX > containerRect.right ||
        e.clientY < containerRect.top ||
        e.clientY > containerRect.bottom
      );

      if (isOutsideCanvas && selectionRect) {
        clearSelection();
        return;
      }

      if (currentTool === 'hand' || e.button === 1) {
        isPanning = true;
        startPanX = e.clientX - panX;
        startPanY = e.clientY - panY;
        canvasViewport.style.cursor = 'grabbing';
        return;
      }

      if (!e.target.classList.contains('render-canvas')) return;
      if (isPlaying) return;

      const coords = getCoords(e);

      if (currentTool === 'eyedropper') {
        pickColor(coords.x, coords.y);
        return;
      }

      if (currentTool === 'move') {
        if (selectionRect && activeFrameIndex !== -1) {
          saveHistory();
          isMoveDragging = true;
          moveDragStart = coords;

          const curFrame = frames[activeFrameIndex];
          const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;

          dragOriginPos = { x: selectionRect.x, y: selectionRect.y };
          if (!draggedData) {
            draggedData = ctx.getImageData(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
            ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
            updateActiveLayerPreview();
          }

          previewCtx.clearRect(0, 0, gridWidth, gridHeight);
          const tempC = document.createElement('canvas');
          tempC.width = draggedData.width;
          tempC.height = draggedData.height;
          tempC.getContext('2d').putImageData(draggedData, 0, 0);
          previewCtx.drawImage(tempC, selectionRect.x, selectionRect.y);

          drawSelectionOverlay();
        }
        return;
      }

      if (currentTool === 'select') {
        isSelecting = true;
        selectStart = coords;
        selectionRect = { x: coords.x, y: coords.y, w: 1, h: 1 };
        drawSelectionOverlay();
        updateToolRibbon();
        return;
      }

      saveHistory();
      isDrawing = true;

      prevDrawX = coords.x;
      prevDrawY = coords.y;

      previewCtx.clearRect(0, 0, gridWidth, gridHeight);

      if (currentTool === 'line') lineStartCoords = coords;
      else if (currentTool === 'shape') shapeStartCoords = coords;
      else if (currentTool === 'bucket') floodFill(coords.x, coords.y, currentColor);
      else drawLineSegment(coords.x, coords.y, coords.x, coords.y);
    });

    window.addEventListener('pointermove', (e) => {
      if (isPanning) {
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        updateTransform();
        return;
      }

      if (isMoveDragging && moveDragStart && draggedData) {
        const coords = getCoords(e);
        const dx = coords.x - moveDragStart.x;
        const dy = coords.y - moveDragStart.y;

        selectionRect.x = dragOriginPos.x + dx;
        selectionRect.y = dragOriginPos.y + dy;

        previewCtx.clearRect(0, 0, gridWidth, gridHeight);
        const tempC = document.createElement('canvas');
        tempC.width = draggedData.width;
        tempC.height = draggedData.height;
        tempC.getContext('2d').putImageData(draggedData, 0, 0);
        previewCtx.drawImage(tempC, selectionRect.x, selectionRect.y);

        drawSelectionOverlay();
        return;
      }

      if (isSelecting && selectStart) {
        const coords = getCoords(e);
        const x = Math.min(selectStart.x, coords.x);
        const y = Math.min(selectStart.y, coords.y);
        const w = Math.abs(coords.x - selectStart.x) + 1;
        const h = Math.abs(coords.y - selectStart.y) + 1;

        selectionRect = { x, y, w, h };
        drawSelectionOverlay();
        return;
      }

      if (!isDrawing && e.target.classList.contains('render-canvas')) {
        const coords = getCoords(e);
        previewCtx.clearRect(0, 0, gridWidth, gridHeight);

        const sz = (currentTool === 'eraser') ? toolOptions.eraserSize : ((currentTool === 'pencil') ? toolOptions.pencilSize : 1);
        const offset = Math.floor((sz - 1) / 2);

        previewCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        previewCtx.fillRect(coords.x - offset, coords.y - offset, sz, sz);
        return;
      }

      if (!isDrawing) return;
      const coords = getCoords(e);

      if (currentTool === 'line' && lineStartCoords) {
        previewCtx.clearRect(0, 0, gridWidth, gridHeight);
        previewCtx.globalAlpha = currentAlpha;
        previewCtx.fillStyle = currentColor;
        const linePixels = getLinePixels(lineStartCoords.x, lineStartCoords.y, coords.x, coords.y);
        const sz = toolOptions.lineSize;
        const offset = Math.floor((sz - 1) / 2);
        linePixels.forEach(p => previewCtx.fillRect(p.x - offset, p.y - offset, sz, sz));
        previewCtx.globalAlpha = 1.0;
      } else if (currentTool === 'shape' && shapeStartCoords) {
        previewCtx.clearRect(0, 0, gridWidth, gridHeight);
        previewCtx.globalAlpha = currentAlpha;
        previewCtx.fillStyle = currentColor;
        const shapePixels = getShapePixels(shapeStartCoords.x, shapeStartCoords.y, coords.x, coords.y, toolOptions.shapeType, toolOptions.shapeFill);
        shapePixels.forEach(p => previewCtx.fillRect(p.x, p.y, 1, 1));
        previewCtx.globalAlpha = 1.0;
      } else if (currentTool === 'pencil' || currentTool === 'eraser') {
        if (prevDrawX !== null && prevDrawY !== null) {
          drawLineSegment(prevDrawX, prevDrawY, coords.x, coords.y);
        } else {
          drawLineSegment(coords.x, coords.y, coords.x, coords.y);
        }
        prevDrawX = coords.x;
        prevDrawY = coords.y;
        updateActiveLayerPreview();
      }
    });

    canvasViewport.addEventListener('mouseleave', () => {
      if (!isDrawing && !isSelecting) {
        previewCtx.clearRect(0, 0, gridWidth, gridHeight);
      }
    });

    window.addEventListener('pointerup', (e) => {
      try { canvasViewport.releasePointerCapture(e.pointerId); } catch(err) {}

      if (isPanning) {
        isPanning = false;
        canvasViewport.style.cursor = (currentTool === 'hand') ? 'grab' : 'default';
        return;
      }

      if (isMoveDragging) {
        isMoveDragging = false;
        previewCtx.clearRect(0, 0, gridWidth, gridHeight);

        if (activeFrameIndex !== -1 && draggedData) {
          const curFrame = frames[activeFrameIndex];
          const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;

          const tempC = document.createElement('canvas');
          tempC.width = draggedData.width;
          tempC.height = draggedData.height;
          tempC.getContext('2d').putImageData(draggedData, 0, 0);

          ctx.drawImage(tempC, selectionRect.x, selectionRect.y);
          updateActiveLayerPreview();
        }

        draggedData = null;
        moveDragStart = null;
        setTool('select');
        return;
      }

      if (isSelecting) {
        isSelecting = false;
        updateToolRibbon();
        return;
      }

      if (!isDrawing) return;
      isDrawing = false;
      prevDrawX = null;
      prevDrawY = null;

      const coords = getCoords(e);
      const curFrame = frames[activeFrameIndex];
      const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;

      if (currentTool === 'line' && lineStartCoords) {
        previewCtx.clearRect(0, 0, gridWidth, gridHeight);
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = currentColor;

        const linePixels = getLinePixels(lineStartCoords.x, lineStartCoords.y, coords.x, coords.y);
        const sz = toolOptions.lineSize;
        const offset = Math.floor((sz - 1) / 2);
        linePixels.forEach(p => ctx.fillRect(p.x - offset, p.y - offset, sz, sz));

        ctx.globalAlpha = 1.0;
        lineStartCoords = null;
        updateActiveLayerPreview();
      } else if (currentTool === 'shape' && shapeStartCoords) {
        previewCtx.clearRect(0, 0, gridWidth, gridHeight);
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = currentColor;

        const shapePixels = getShapePixels(shapeStartCoords.x, shapeStartCoords.y, coords.x, coords.y, toolOptions.shapeType, toolOptions.shapeFill);
        shapePixels.forEach(p => ctx.fillRect(p.x, p.y, 1, 1));

        ctx.globalAlpha = 1.0;
        shapeStartCoords = null;
        updateActiveLayerPreview();
      }
    });

    canvasViewport.addEventListener('wheel', (e) => {
      e.preventDefault();

      const zoomFactor = 1.15;
      if (e.deltaY < 0) {
        zoomScale = Math.min(zoomScale * zoomFactor, 8);
      } else {
        zoomScale = Math.max(zoomScale / zoomFactor, 0.2);
      }

      updateTransform();
    }, { passive: false });

    canvasViewport.addEventListener('dragover', (e) => e.preventDefault());
    canvasViewport.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];

        if (file.name.endsWith('.pix') || file.name.endsWith('.json')) {
          loadProjectFromFile(file);
        } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              pendingDroppedImage = img;
              splitTargetWidth.value = img.width;
              splitOriginalSizeInfo.innerText = `원본: ${img.width} x ${img.height} px`;
              splitColsInput.value = 1;
              splitRowsInput.value = 1;
              splitImageModal.style.display = 'flex';
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      }
    });

    // --- 클립보드 붙여넣기 (현재 레이어 적용 + 크기 조절 프롬프트) ---
    window.addEventListener('paste', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                if (typeof activeFrameIndex === 'undefined' || activeFrameIndex === -1) {
                  alert("먼저 프레임을 선택해주세요!");
                  return;
                }

                const origW = img.width;
                const origH = img.height;

                const widthInputStr = prompt(`불러올 이미지의 가로 크기(px)를 입력하세요:\n(원본 크기: ${origW} x ${origH})`, origW);
                if (widthInputStr === null) return;

                const targetW = parseInt(widthInputStr) || origW;
                const ratio = origH / origW;
                const targetH = Math.round(targetW * ratio);

                if (typeof saveHistory === 'function') {
                  saveHistory();
                }

                // 캔버스가 이미 붙여넣을 이미지보다 크면 화면을 줄이지 않고,
                // 가로/세로 중 더 작은 쪽만 이미지 크기에 맞춰 키운다.
                const newCanvasW = Math.max(gridWidth, targetW);
                const newCanvasH = Math.max(gridHeight, targetH);
                if (typeof resizeCanvasSmart === 'function' && (newCanvasW !== gridWidth || newCanvasH !== gridHeight)) {
                  resizeCanvasSmart(newCanvasW, newCanvasH, false);
                }

                const curFrame = frames[activeFrameIndex];
                const activeLayer = curFrame.layers[curFrame.activeLayerIndex];
                const ctx = activeLayer.ctx;

                ctx.clearRect(0, 0, gridWidth, gridHeight);
                ctx.drawImage(img, 0, 0, targetW, targetH);

                if (typeof updateActiveLayerPreview === 'function') {
                  updateActiveLayerPreview();
                }
                if (typeof showToast === 'function') {
                  showToast(`이미지를 ${targetW}x${targetH}px 크기로 붙여넣었습니다`);
                }
              };
              img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      const key = e.key.toLowerCase();

      if (e.key === 'Escape') {
        clearSelection();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectionRect && activeFrameIndex !== -1) {
          e.preventDefault();
          saveHistory();
          const curFrame = frames[activeFrameIndex];
          const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;
          ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
          updateActiveLayerPreview();
          showToast('선택 영역 삭제 완료');
        }
      } else if (key === '1') {
        setTool('pencil');
      } else if (key === '2') {
        setTool('line');
      } else if (key === '3') {
        setTool('bucket');
      } else if (key === 'q') {
        setTool('eraser');
      } else if (key === 'w') {
        setTool('shape');
      } else if (key === 'e') {
        setTool('eyedropper');
      } else if (key === 'a') {
        setTool('hand');
      } else if (key === 's') {
        setTool('select');
      } else if (key === 'd') {
        setTool('move');
      } else if (key === 'r') {
        panX = 0; panY = 0; zoomScale = 1;
        updateTransform();
      } else if (key === 'z' && !e.ctrlKey) {
        if (frames.length > 0 && activeFrameIndex > 0) {
          selectFrame(activeFrameIndex - 1);
        }
      } else if (key === 'c' && !e.ctrlKey) {
        if (frames.length > 0 && activeFrameIndex < frames.length - 1) {
          selectFrame(activeFrameIndex + 1);
        }
      } else if (e.ctrlKey && key === 'c') {
        e.preventDefault();
        if (activeFrameIndex === -1 || !selectionRect) return;
        const curFrame = frames[activeFrameIndex];
        const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;
        clipboardBuffer = {
          data: ctx.getImageData(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h),
          width: selectionRect.w,
          height: selectionRect.h
        };
        showToast('선택 영역 복사 완료');
      } else if (e.ctrlKey && key === 'x') {
        e.preventDefault();
        if (activeFrameIndex === -1 || !selectionRect) return;
        saveHistory();
        const curFrame = frames[activeFrameIndex];
        const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;
        clipboardBuffer = {
          data: ctx.getImageData(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h),
          width: selectionRect.w,
          height: selectionRect.h
        };
        ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        updateActiveLayerPreview();
        showToast('선택 영역 잘라내기 완료');
      } else if (e.ctrlKey && key === 'v') {
        e.preventDefault();
        if (!clipboardBuffer || activeFrameIndex === -1) return;
        setTool('move');
        draggedData = clipboardBuffer.data;
        
        const targetX = Math.floor((gridWidth - clipboardBuffer.width) / 2);
        const targetY = Math.floor((gridHeight - clipboardBuffer.height) / 2);

        selectionRect = { x: targetX, y: targetY, w: clipboardBuffer.width, h: clipboardBuffer.height };
        dragOriginPos = { x: targetX, y: targetY };
        isMoveDragging = true;
        moveDragStart = { x: targetX + Math.floor(clipboardBuffer.width / 2), y: targetY + Math.floor(clipboardBuffer.height / 2) };

        previewCtx.clearRect(0, 0, gridWidth, gridHeight);
        const tempC = document.createElement('canvas');
        tempC.width = draggedData.width;
        tempC.height = draggedData.height;
        tempC.getContext('2d').putImageData(draggedData, 0, 0);
        previewCtx.drawImage(tempC, selectionRect.x, selectionRect.y);
        drawSelectionOverlay();
        showToast('붙여넣을 위치를 클릭하세요');
      } else if (e.ctrlKey && key === 'z') {
        e.preventDefault(); undo();
      } else if (e.ctrlKey && key === 'y') {
        e.preventDefault(); redo();
      }
    });

    addFrameBtn.addEventListener('click', () => {
      addFrame();
    });

    // --- 상단 리본 그룹 표시/숨김 (후처리 패널에서 켜고 끄기) ---
    (function setupRibbonToggles() {
      const RIBBON_MAP = {
        toggleRibbonCanvasSettings: 'ribbonCanvasSettings',
        toggleRibbonAnimation: 'ribbonAnimation',
        toggleRibbonEditAlign: 'ribbonEditAlign',
        toggleRibbonPageManage: 'ribbonPageManage'
      };
      const STORAGE_KEY = 'pixelmeow_ribbon_visibility';

      let savedState = {};
      try {
        savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      } catch (e) {
        savedState = {};
      }

      Object.entries(RIBBON_MAP).forEach(([checkboxId, groupId]) => {
        const checkbox = document.getElementById(checkboxId);
        const group = document.getElementById(groupId);
        if (!checkbox || !group) return;

        // 저장된 상태가 있으면 반영, 없으면 기본값(표시) 유지
        if (Object.prototype.hasOwnProperty.call(savedState, groupId)) {
          const visible = savedState[groupId];
          checkbox.checked = visible;
          group.style.display = visible ? '' : 'none';
        }

        checkbox.addEventListener('change', () => {
          group.style.display = checkbox.checked ? '' : 'none';
          savedState[groupId] = checkbox.checked;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
        });
      });
    })();

    // --- 텍스트/숫자 입력창 클릭 시 값 전체 선택 (키보드로 값 바꾸기 편하게) ---
    document.addEventListener('mouseup', (e) => {
      const t = e.target;
      if (t && t.tagName === 'INPUT' && (t.type === 'text' || t.type === 'number')) {
        t.select();
      }
    });

    addLayerBtn.addEventListener('click', () => {
      addLayer();
    });

    playBtn.addEventListener('click', () => {
      if (frames.length === 0) return;
      isPlaying = !isPlaying;

      if (isPlaying) {
        playBtn.innerText = '정지';
        playBtn.classList.add('playing');
        
        onionPrevCanvas.style.opacity = 0;
        onionNextCanvas.style.opacity = 0;

        let curPlayIdx = activeFrameIndex >= 0 ? activeFrameIndex : 0;
        const fps = parseInt(fpsInput.value) || 6;

        if (playInterval) clearInterval(playInterval);

        playInterval = setInterval(() => {
          frames.forEach((f, idx) => {
            f.layers.forEach(l => {
              l.canvas.style.display = (idx === curPlayIdx && f.visible && l.visible) ? 'block' : 'none';
            });
          });
          curPlayIdx = (curPlayIdx + 1) % frames.length;
        }, 1000 / fps);
      } else {
        playBtn.innerText = '재생';
        playBtn.classList.remove('playing');

        if (playInterval) {
          clearInterval(playInterval);
          playInterval = null;
        }

        if (activeFrameIndex >= 0) {
          selectFrame(activeFrameIndex);
        }
        updateOnionSkin();
      }
    });

   // --- 갤러리 저장 모달 및 이어서 작업하기 로직 ---
    const artSaveModal = document.getElementById('artSaveModal');
    const closeArtSaveModal = document.getElementById('closeArtSaveModal');
    const saveModalTitleInput = document.getElementById('saveModalTitleInput');
    const saveModalDescInput = document.getElementById('saveModalDescInput');
    const saveModalCanvas = document.getElementById('saveModalCanvas');
    const saveModalBtnContainer = document.getElementById('saveModalBtnContainer');

    let saveModalAnimInterval = null;

    // 참고: 상세 페이지(detail.html)에서 "이어서 작업"으로 넘어왔을 때의 실제 복원은
    // 위쪽의 파이어베이스 기반 복원 로직(DOMContentLoaded, editingArtId 설정 부분)에서
    // 프레임/레이어까지 전부 처리하므로 여기서 별도 처리하지 않음.

    // 사이드바의 '작품 저장하기' 버튼 클릭 시 모달 오픈
    shareArtBtn.addEventListener('click', () => {
      if (frames.length === 0) return;

      artSaveModal.style.display = 'flex';
      saveModalTitleInput.value = fileNameInput.value || "My Pixel Art";

      // 1. 미리보기 애니메이션 재생 시작
      saveModalCanvas.width = gridWidth * 16;
      saveModalCanvas.height = gridHeight * 16;
      const mCtx = saveModalCanvas.getContext('2d');
      mCtx.imageSmoothingEnabled = false;

      let fIdx = 0;
      const fps = parseInt(fpsInput.value) || 6;
      if (saveModalAnimInterval) clearInterval(saveModalAnimInterval);

      saveModalAnimInterval = setInterval(() => {
        const curF = frames[fIdx];
        mCtx.clearRect(0, 0, saveModalCanvas.width, saveModalCanvas.height);

        const tempC = document.createElement('canvas');
        tempC.width = gridWidth;
        tempC.height = gridHeight;
        const tempCtx = tempC.getContext('2d');
        curF.layers.forEach(l => { if (l.visible) tempCtx.drawImage(l.canvas, 0, 0); });

        mCtx.drawImage(tempC, 0, 0, saveModalCanvas.width, saveModalCanvas.height);
        fIdx = (fIdx + 1) % frames.length;
      }, 1000 / fps);

      // 2. 버튼 구성 설정 (이어서 작업 중이라면 덮어쓰기 + 새로 저장, 아니면 새로 저장만)
      saveModalBtnContainer.innerHTML = '';
      const cancelBtn = document.createElement('button');
      cancelBtn.innerText = '취소';
      cancelBtn.style.cssText = 'flex:1; background:#555; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-size:12px;';
      cancelBtn.onclick = () => {
        artSaveModal.style.display = 'none';
        if (saveModalAnimInterval) clearInterval(saveModalAnimInterval);
      };
      saveModalBtnContainer.appendChild(cancelBtn);

      if (editingArtId) {
        // 덮어쓰기 버튼
        const overwriteBtn = document.createElement('button');
        overwriteBtn.innerText = '덮어쓰기';
        overwriteBtn.style.cssText = 'flex:1; background:#0e639c; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;';
        overwriteBtn.onclick = () => executeSave(true);
        saveModalBtnContainer.appendChild(overwriteBtn);
      }

      // 새로 저장하기 버튼
      const newSaveBtn = document.createElement('button');
      newSaveBtn.innerText = '새로 저장하기';
      newSaveBtn.style.cssText = 'flex:1; background:#388e3c; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;';
      newSaveBtn.onclick = () => executeSave(false);
      saveModalBtnContainer.appendChild(newSaveBtn);
    });

    // 실제 파이어베이스 저장 수행 함수
    async function executeSave(isOverwrite) {
      const title = saveModalTitleInput.value.trim();
      const author = saveModalDescInput.value.trim() || "내 작품";
      if (!title) {
        alert("작품 제목을 입력해주세요.");
        return;
      }

      showToast(isOverwrite ? "작품을 덮어쓰는 중..." : "새 작품으로 저장하는 중...");

      try {
        const tempC = document.createElement('canvas');
        tempC.width = gridWidth;
        tempC.height = gridHeight;
        const tempCtx = tempC.getContext('2d');
        frames[0].layers.forEach(l => { if (l.visible) tempCtx.drawImage(l.canvas, 0, 0); });
        const previewDataUrl = tempC.toDataURL();

        // 로컬 .pix 파일 저장(saveProjectBtn)과 동일한 방식으로 프레임/레이어를 직렬화.
        // 이걸 같이 저장해야 '이어서 작업하기'에서 애니메이션/레이어 구조가 그대로 복원됨.
        const framesPayload = frames.map(f => ({
          visible: f.visible,
          layers: f.layers.map(l => ({
            name: l.name,
            visible: l.visible,
            dataUrl: l.canvas.toDataURL()
          }))
        }));

        // Firestore 문서 하나당 최대 약 1MiB. 프레임/레이어가 많으면 초과할 수 있으므로
        // 미리 크기를 재서, 넘으면 frames 없이(미리보기만) 저장하고 사용자에게 알려줌.
        const framesJsonSize = new Blob([JSON.stringify(framesPayload)]).size;
        const FIRESTORE_DOC_LIMIT = 1048487; // 약 1MiB (여유분 확보)
        const canSaveFrames = framesJsonSize < FIRESTORE_DOC_LIMIT * 0.9; // preview 등 다른 필드 여유도 감안

        const payload = {
          title: title,
          author: author,
          preview: previewDataUrl,
          width: gridWidth,
          height: gridHeight
        };
        if (canSaveFrames) {
          payload.frames = framesPayload;
        } else {
          console.warn(`프레임 데이터가 너무 커서(${framesJsonSize} bytes) Firestore에 저장하지 않았습니다. 미리보기 이미지만 저장됩니다.`);
        }

        if (isOverwrite && editingArtId) {
          // 기존 문서 덮어쓰기 (Update)
          const docRef = window.pixelFirebase.doc(window.pixelFirebase.db, "arts", editingArtId);
          await window.pixelFirebase.updateDoc(docRef, payload);
          showToast(canSaveFrames ? "성공적으로 덮어씌워졌습니다!" : "덮어썼지만 용량이 커서 미리보기만 저장됐어요.");
        } else {
          // 새로 저장하기 (Add)
          const docRef = await window.pixelFirebase.addDoc(
            window.pixelFirebase.collection(window.pixelFirebase.db, "arts"),
            { ...payload, createdAt: new Date() }
          );

          let myArts = JSON.parse(localStorage.getItem('my_pixel_arts') || '[]');
          myArts.unshift(docRef.id);
          localStorage.setItem('my_pixel_arts', JSON.stringify(myArts));

          editingArtId = docRef.id; // 이후부터는 이어서 작업 상태로 전환
          showToast(canSaveFrames ? "내 갤러리에 새로 저장되었습니다!" : "저장했지만 용량이 커서 미리보기만 저장됐어요.");
        }

        artSaveModal.style.display = 'none';
        if (saveModalAnimInterval) clearInterval(saveModalAnimInterval);

      } catch (err) {
        console.error(err);
        alert("저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
      }
    }

    // --- 클립보드 이미지 직접 읽기 버튼 이벤트 (현재 레이어 적용) ---
    const pasteClipboardBtn = document.getElementById('pasteClipboardBtn');
    if (pasteClipboardBtn) {
      pasteClipboardBtn.addEventListener('click', async () => {
        try {
          const clipboardItems = await navigator.clipboard.read();
          for (const item of clipboardItems) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
              const blob = await item.getType(imageType);
              const reader = new FileReader();
              reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                  if (activeFrameIndex === -1) {
                    alert("먼저 프레임을 선택해주세요!");
                    return;
                  }

                  const origW = img.width;
                  const origH = img.height;

                  const widthInputStr = prompt(`불러올 이미지의 가로 크기(px)를 입력하세요:\n(원본 크기: ${origW} x ${origH})`, origW);
                  if (widthInputStr === null) return;

                  const targetW = parseInt(widthInputStr) || origW;
                  const ratio = origH / origW;
                  const targetH = Math.round(targetW * ratio);

                  if (typeof saveHistory === 'function') saveHistory();

                  // 캔버스가 이미 붙여넣을 이미지보다 크면 화면을 줄이지 않고,
                  // 가로/세로 중 더 작은 쪽만 이미지 크기에 맞춰 키운다.
                  const newCanvasW = Math.max(gridWidth, targetW);
                  const newCanvasH = Math.max(gridHeight, targetH);
                  if (typeof resizeCanvasSmart === 'function' && (newCanvasW !== gridWidth || newCanvasH !== gridHeight)) {
                    resizeCanvasSmart(newCanvasW, newCanvasH, false);
                  }

                  const curFrame = frames[activeFrameIndex];
                  const activeLayer = curFrame.layers[curFrame.activeLayerIndex];
                  const ctx = activeLayer.ctx;

                  ctx.clearRect(0, 0, gridWidth, gridHeight);
                  ctx.drawImage(img, 0, 0, targetW, targetH);

                  updateActiveLayerPreview();
                  showToast(`이미지를 ${targetW}x${targetH}px 크기로 붙여넣었습니다`);
                };
                img.src = event.target.result;
              };
              reader.readAsDataURL(blob);
              return;
            }
          }
          alert("클립보드에 복사된 이미지가 없습니다!");
        } catch (err) {
          console.error(err);
          alert("브라우저 보안 정책으로 클립보드를 읽지 못했습니다. 에디터 화면을 마우스로 한 번 클릭한 뒤 다시 시도해 주세요.");
        }
      });
    }

    saveBtn.addEventListener('click', async () => {
      if (frames.length === 0) return;
      const scale = parseInt(scaleSelect.value) || 1;
      const inputCols = parseInt(columnsInput.value) || 4;
      const cols = Math.min(frames.length, Math.max(1, inputCols));
      const rows = Math.ceil(frames.length / cols);

      const sheetW = gridWidth * scale * cols;
      const sheetH = gridHeight * scale * rows;

      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;
      const sCtx = sheetCanvas.getContext('2d');
      sCtx.imageSmoothingEnabled = false;

      frames.forEach((f, idx) => {
        const tempC = document.createElement('canvas');
        tempC.width = gridWidth;
        tempC.height = gridHeight;
        const tempCtx = tempC.getContext('2d');
        f.layers.forEach(l => { if (l.visible) tempCtx.drawImage(l.canvas, 0, 0); });

        const cX = (idx % cols) * gridWidth * scale;
        const cY = Math.floor(idx / cols) * gridHeight * scale;

        sCtx.drawImage(tempC, 0, 0, gridWidth, gridHeight, cX, cY, gridWidth * scale, gridHeight * scale);
      });

      const baseName = fileNameInput.value || 'my-pixel-art';
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: baseName + '.png',
            types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }]
          });
          const writable = await handle.createWritable();
          const blob = await new Promise(resolve => sheetCanvas.toBlob(resolve, 'image/png'));
          await writable.write(blob);
          await writable.close();
          showToast('통합 PNG 저장 완료');
          return;
        } catch (err) {
          if (err.name !== 'AbortError') console.error(err);
          else return;
        }
      }

      const link = document.createElement('a');
      link.download = baseName + '.png';
      link.href = sheetCanvas.toDataURL('image/png');
      link.click();
      showToast('통합 PNG 저장 완료');
    });

    saveSeparateBtn.addEventListener('click', async () => {
      if (frames.length === 0) return;
      const scale = parseInt(scaleSelect.value) || 1;
      const baseName = fileNameInput.value || 'frame';

      if (window.showDirectoryPicker) {
        try {
          const dirHandle = await window.showDirectoryPicker();
          for (let idx = 0; idx < frames.length; idx++) {
            const f = frames[idx];
            const tempC = document.createElement('canvas');
            tempC.width = gridWidth * scale;
            tempC.height = gridHeight * scale;
            const tempCtx = tempC.getContext('2d');
            tempCtx.imageSmoothingEnabled = false;

            const subC = document.createElement('canvas');
            subC.width = gridWidth;
            subC.height = gridHeight;
            const subCtx = subC.getContext('2d');
            f.layers.forEach(l => { if (l.visible) subCtx.drawImage(l.canvas, 0, 0); });

            tempCtx.drawImage(subC, 0, 0, gridWidth, gridHeight, 0, 0, gridWidth * scale, gridHeight * scale);

            const fileHandle = await dirHandle.getFileHandle(`${baseName}_${idx + 1}.png`, { create: true });
            const writable = await fileHandle.createWritable();
            const blob = await new Promise(resolve => tempC.toBlob(resolve, 'image/png'));
            await writable.write(blob);
            await writable.close();
          }
          showToast('개별 프레임 폴더 저장 완료');
          return;
        } catch (err) {
          if (err.name !== 'AbortError') console.error(err);
          else return;
        }
      }

      frames.forEach((f, idx) => {
        const tempC = document.createElement('canvas');
        tempC.width = gridWidth * scale;
        tempC.height = gridHeight * scale;
        const tempCtx = tempC.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;

        const subC = document.createElement('canvas');
        subC.width = gridWidth;
        subC.height = gridHeight;
        const subCtx = subC.getContext('2d');
        f.layers.forEach(l => { if (l.visible) subCtx.drawImage(l.canvas, 0, 0); });

        tempCtx.drawImage(subC, 0, 0, gridWidth, gridHeight, 0, 0, gridWidth * scale, gridHeight * scale);

        const link = document.createElement('a');
        link.download = `${baseName}_${idx + 1}.png`;
        link.href = tempC.toDataURL('image/png');
        link.click();
      });
      showToast('개별 프레임 저장 완료');
    });

    saveGifBtn.addEventListener('click', async () => {
      if (frames.length === 0) return;
      const scale = parseInt(scaleSelect.value) || 1;
      const fps = parseInt(fpsInput.value) || 6;
      const baseName = fileNameInput.value || 'animation';

      showToast('GIF 생성 중...');

      try {
        const workerResponse = await fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js');
        const workerCode = await workerResponse.text();
        const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);

        const gif = new GIF({
          workers: 2,
          workerScript: workerUrl,
          quality: 10,
          width: gridWidth * scale,
          height: gridHeight * scale,
          transparent: 0x000000
        });

        frames.forEach(f => {
          const tempC = document.createElement('canvas');
          tempC.width = gridWidth * scale;
          tempC.height = gridHeight * scale;
          const tempCtx = tempC.getContext('2d');
          tempCtx.imageSmoothingEnabled = false;

          const subC = document.createElement('canvas');
          subC.width = gridWidth;
          subC.height = gridHeight;
          const subCtx = subC.getContext('2d');
          f.layers.forEach(l => { if (l.visible) subCtx.drawImage(l.canvas, 0, 0); });

          tempCtx.drawImage(subC, 0, 0, gridWidth, gridHeight, 0, 0, gridWidth * scale, gridHeight * scale);
          gif.addFrame(tempC, { delay: 1000 / fps });
        });

        gif.on('finished', async (blob) => {
          if (window.showSaveFilePicker) {
            try {
              const handle = await window.showSaveFilePicker({
                suggestedName: baseName + '.gif',
                types: [{ description: 'GIF Animation', accept: { 'image/gif': ['.gif'] } }]
              });
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              showToast('GIF 애니메이션 저장 완료');
              return;
            } catch (err) {
              if (err.name !== 'AbortError') console.error(err);
              else return;
            }
          }

          const link = document.createElement('a');
          link.download = baseName + '.gif';
          link.href = URL.createObjectURL(blob);
          link.click();
          showToast('GIF 애니메이션 저장 완료');
        });

        gif.render();
      } catch (err) {
        console.error(err);
        showToast('GIF 생성 실패 (네트워크 또는 워커 오류)');
      }
    });

    saveProjectBtn.addEventListener('click', async () => {
      if (frames.length === 0) return;
      const projectData = {
        width: gridWidth,
        height: gridHeight,
        frames: frames.map(f => ({
          visible: f.visible,
          layers: f.layers.map(l => ({
            name: l.name,
            visible: l.visible,
            dataUrl: l.canvas.toDataURL()
          }))
        }))
      };

      const baseName = fileNameInput.value || 'project';
      const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });

      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: baseName + '.pix',
            types: [{ description: 'Pixel-meow Project', accept: { 'application/json': ['.pix'] } }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          showToast('프로젝트 파일 저장 완료');
          return;
        } catch (err) {
          if (err.name !== 'AbortError') console.error(err);
          else return;
        }
      }

      const link = document.createElement('a');
      link.download = baseName + '.pix';
      link.href = URL.createObjectURL(blob);
      link.click();
      showToast('프로젝트 파일 저장 완료');
    });

    loadProjectBtn.addEventListener('click', () => {
      projectFileInput.click();
    });

    projectFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadProjectFromFile(e.target.files[0]);
      }
    });

    function loadProjectFromFile(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (!data.width || !data.height || !data.frames) {
            alert('유효하지 않은 프로젝트 파일입니다.');
            return;
          }

          gridWidth = data.width;
          gridHeight = data.height;
          widthInput.value = gridWidth;
          heightInput.value = gridHeight;
          updateContainerDimensions();
          drawGrid();

          frames.forEach(f => f.layers.forEach(l => l.canvas.remove()));
          frames = [];
          frameListEl.innerHTML = '';
          layerListEl.innerHTML = '';
          frameIdCounter = 0;
          layerIdCounter = 0;

          let loadedCount = 0;
          const totalFrames = data.frames.length;

          data.frames.forEach((fData) => {
            addFrame();
            const curF = frames[frames.length - 1];
            curF.visible = fData.visible;
            if (!curF.visible) curF.blockEl.classList.add('hidden-block');

            curF.layers[0].canvas.remove();
            curF.layers = [];

            let layerLoadedCount = 0;
            fData.layers.forEach((lData) => {
              createLayerForFrame(curF);
              const curL = curF.layers[curF.layers.length - 1];
              curL.name = lData.name;
              curL.visible = lData.visible;

              const img = new Image();
              img.onload = () => {
                curL.ctx.clearRect(0, 0, gridWidth, gridHeight);
                curL.ctx.drawImage(img, 0, 0);
                updateActiveLayerPreview();
                layerLoadedCount++;
                if (layerLoadedCount === fData.layers.length) {
                  loadedCount++;
                  if (loadedCount === totalFrames) {
                    selectFrame(0);
                    showToast('프로젝트 불러오기 완료');
                  }
                }
              };
              img.src = lData.dataUrl;
            });
          });
        } catch (err) {
          alert('프로젝트 파일을 읽는 중 오류가 발생했습니다.');
        }
      };
      reader.readAsText(file);
    }

    function getLinePixels(x0, y0, x1, y1) {
      const pixels = [];
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = (x0 < x1) ? 1 : -1;
      const sy = (y0 < y1) ? 1 : -1;
      let err = dx - dy;

      while (true) {
        pixels.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
      return pixels;
    }

    function floodFill(startX, startY, fillHex) {
      if (activeFrameIndex === -1) return;
      const curFrame = frames[activeFrameIndex];
      const ctx = curFrame.layers[curFrame.activeLayerIndex].ctx;

      const imgData = ctx.getImageData(0, 0, gridWidth, gridHeight);
      const data = imgData.data;

      const targetPos = (startY * gridWidth + startX) * 4;
      const targetR = data[targetPos];
      const targetG = data[targetPos + 1];
      const targetB = data[targetPos + 2];
      const targetA = data[targetPos + 3];

      let fillR = 0, fillG = 0, fillB = 0, fillA = Math.round(currentAlpha * 255);
      if (fillHex.length === 7) {
        fillR = parseInt(fillHex.slice(1, 3), 16);
        fillG = parseInt(fillHex.slice(3, 5), 16);
        fillB = parseInt(fillHex.slice(5, 7), 16);
      }

      const tol = toolOptions.bucketTolerance;

      function colorMatch(pos) {
        const dr = Math.abs(data[pos] - targetR);
        const dg = Math.abs(data[pos + 1] - targetG);
        const db = Math.abs(data[pos + 2] - targetB);
        const da = Math.abs(data[pos + 3] - targetA);
        return (dr <= tol && dg <= tol && db <= tol && da <= tol);
      }

      if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) return;

      const queue = [[startX, startY]];

      while (queue.length > 0) {
        const [x, y] = queue.pop();
        if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) continue;

        const pos = (y * gridWidth + x) * 4;

        if (colorMatch(pos)) {
          data[pos] = fillR;
          data[pos + 1] = fillG;
          data[pos + 2] = fillB;
          data[pos + 3] = fillA;

          queue.push([x + 1, y]);
          queue.push([x - 1, y]);
          queue.push([x, y + 1]);
          queue.push([x, y - 1]);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      updateActiveLayerPreview();
    }

    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
      generate10Shades(currentColor);
    });

    alphaInput.addEventListener('input', (e) => {
      currentAlpha = parseInt(e.target.value) / 100;
      alphaVal.innerText = 100 - parseInt(e.target.value) + '%';
    });

    document.querySelectorAll('.bg-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.bg-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        canvasContainer.className = 'canvas-container ' + opt.dataset.bg;
      });
    });

    pencilBtn.addEventListener('click', () => setTool('pencil'));
    lineBtn.addEventListener('click', () => setTool('line'));
    bucketBtn.addEventListener('click', () => setTool('bucket'));
    eraserBtn.addEventListener('click', () => setTool('eraser'));
    shapeBtn.addEventListener('click', () => setTool('shape'));
    eyedropperBtn.addEventListener('click', () => setTool('eyedropper'));
    handToolBtn.addEventListener('click', () => setTool('hand'));
    selectToolBtn.addEventListener('click', () => setTool('select'));
    moveToolBtn.addEventListener('click', () => setTool('move'));

    function setTool(tool) {
      currentTool = tool;
      [pencilBtn, lineBtn, bucketBtn, eraserBtn, shapeBtn, eyedropperBtn, handToolBtn, selectToolBtn, moveToolBtn].forEach(btn => btn.classList.remove('active'));

      if (tool === 'pencil') pencilBtn.classList.add('active');
      if (tool === 'line') lineBtn.classList.add('active');
      if (tool === 'bucket') bucketBtn.classList.add('active');
      if (tool === 'eraser') eraserBtn.classList.add('active');
      if (tool === 'shape') shapeBtn.classList.add('active');
      if (tool === 'eyedropper') eyedropperBtn.classList.add('active');
      if (tool === 'hand') {
        handToolBtn.classList.add('active');
        canvasViewport.style.cursor = 'grab';
      } else {
        canvasViewport.style.cursor = 'default';
      }
      if (tool === 'select') selectToolBtn.classList.add('active');
      if (tool === 'move') moveToolBtn.classList.add('active');

      updateToolRibbon();
    }

    prevOpacityInput.addEventListener('input', (e) => {
      prevFrameOpacity = parseInt(e.target.value) / 100;
      prevOpacityVal.innerText = `${e.target.value}%`;
      updateOnionSkin();
    });

    nextOpacityInput.addEventListener('input', (e) => {
      nextFrameOpacity = parseInt(e.target.value) / 100;
      nextOpacityVal.innerText = `${e.target.value}%`;
      updateOnionSkin();
    });

    function updateCanvasFilters() {
      const b = brightnessInput.value;
      const c = contrastInput.value;
      const s = saturateInput.value;
      const op = canvasOpacityInput.value;

      brightnessVal.innerText = `${b}%`;
      contrastVal.innerText = `${c}%`;
      saturateVal.innerText = `${s}%`;
      canvasOpacityVal.innerText = `${op}%`;

      canvasContainer.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) opacity(${op}%)`;
    }

    [brightnessInput, contrastInput, saturateInput, canvasOpacityInput].forEach(inp => {
      inp.addEventListener('input', updateCanvasFilters);
    });

    // --- 레이어 개별 수정 모달 로직 ---
    const layerEditModal = document.getElementById('layerEditModal');
    const closeLayerEditModal = document.getElementById('closeLayerEditModal');
    const saveLayerEditModal = document.getElementById('saveLayerEditModal');
    const editLayerNameInput = document.getElementById('editLayerNameInput');
    
    const layerModalBrightInput = document.getElementById('layerModalBrightInput');
    const layerModalContrastInput = document.getElementById('layerModalContrastInput');
    const layerModalSaturateInput = document.getElementById('layerModalSaturateInput');
    const layerModalOpacityInput = document.getElementById('layerModalOpacityInput');

    const layerModalBrightVal = document.getElementById('layerModalBrightVal');
    const layerModalContrastVal = document.getElementById('layerModalContrastVal');
    const layerModalSaturateVal = document.getElementById('layerModalSaturateVal');
    const layerModalOpacityVal = document.getElementById('layerModalOpacityVal');

    let targetEditingLayer = null;

    layerModalBrightInput.addEventListener('input', () => layerModalBrightVal.innerText = `${layerModalBrightInput.value}%`);
    layerModalContrastInput.addEventListener('input', () => layerModalContrastVal.innerText = `${layerModalContrastInput.value}%`);
    layerModalSaturateInput.addEventListener('input', () => layerModalSaturateVal.innerText = `${layerModalSaturateInput.value}%`);
    layerModalOpacityInput.addEventListener('input', () => layerModalOpacityVal.innerText = `${layerModalOpacityInput.value}%`);

    function openLayerEditModal(layerObj) {
      targetEditingLayer = layerObj;
      editLayerNameInput.value = layerObj.name;

      layerModalBrightInput.value = layerObj.brightness !== undefined ? layerObj.brightness : 100;
      layerModalContrastInput.value = layerObj.contrast !== undefined ? layerObj.contrast : 100;
      layerModalSaturateInput.value = layerObj.saturate !== undefined ? layerObj.saturate : 100;
      layerModalOpacityInput.value = layerObj.opacity !== undefined ? layerObj.opacity : 100;

      layerModalBrightVal.innerText = `${layerModalBrightInput.value}%`;
      layerModalContrastVal.innerText = `${layerModalContrastInput.value}%`;
      layerModalSaturateVal.innerText = `${layerModalSaturateInput.value}%`;
      layerModalOpacityVal.innerText = `${layerModalOpacityInput.value}%`;

      layerEditModal.style.display = 'flex';
    }

    closeLayerEditModal.addEventListener('click', () => {
      layerEditModal.style.display = 'none';
      targetEditingLayer = null;
    });

    saveLayerEditModal.addEventListener('click', () => {
      if (!targetEditingLayer) return;

      const newName = editLayerNameInput.value.trim();
      if (newName) targetEditingLayer.name = newName;

      targetEditingLayer.brightness = parseInt(layerModalBrightInput.value);
      targetEditingLayer.contrast = parseInt(layerModalContrastInput.value);
      targetEditingLayer.saturate = parseInt(layerModalSaturateInput.value);
      targetEditingLayer.opacity = parseInt(layerModalOpacityInput.value);

      targetEditingLayer.canvas.style.filter = `brightness(${targetEditingLayer.brightness}%) contrast(${targetEditingLayer.contrast}%) saturate(${targetEditingLayer.saturate}%) opacity(${targetEditingLayer.opacity}%)`;

      renderLayerUI();
      layerEditModal.style.display = 'none';
      targetEditingLayer = null;
      showToast('레이어 설정이 수정되었습니다.');
    });

    initEditor();