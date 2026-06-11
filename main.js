document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       模組一：地圖互動邏輯
       ========================================= */
    const cities = document.querySelectorAll('.city-path');
    const infoBox = document.getElementById('map-info');
    const regionData = Array.from(cities).map(city => ({
        id: city.id,
        name: city.getAttribute('data-name'),
        trash: Number(city.getAttribute('data-trash'))
    }));

    function getPollutionLevel(trashAmount) {
        if (trashAmount >= 700) {
            return { text: '高污染熱點', className: 'level-high' };
        }
        if (trashAmount >= 400) {
            return { text: '中高污染', className: 'level-medium-high' };
        }
        if (trashAmount >= 200) {
            return { text: '中度污染', className: 'level-medium' };
        }
        return { text: '低污染', className: 'level-low' };
    }

    cities.forEach(city => {
        city.addEventListener('click', function() {
            cities.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const cityName = this.getAttribute('data-name');
            const trashAmount = Number(this.getAttribute('data-trash'));
            const pollutionLevel = getPollutionLevel(trashAmount);
            
            infoBox.innerHTML = `
                <h3>📍 ${cityName}</h3>
                <span class="pollution-badge ${pollutionLevel.className}">${pollutionLevel.text}</span>
                <p>今年度累計海岸垃圾量：<strong>${trashAmount} 噸</strong></p>
            `;
            btnTrend.classList.add('active');
            btnComposition.classList.remove('active');
            renderRegionChart(cityName);
        });
    });

    /* =========================================
       模組二：Chart.js 圖表邏輯
       ========================================= */
    const ctx = document.getElementById('debrisChart').getContext('2d');
    let currentChart;

    const compositionData = {
        type: 'pie',
        data: {
            labels: ['塑膠瓶蓋', '寶特瓶', '免洗餐具', '塑膠袋', '漁網漁具與其他'],
            datasets: [{
                data: [30, 25, 15, 15, 15],
                backgroundColor: ['#38bdf8', '#fbbf24', '#f87171', '#34d399', '#94a3b8'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    };

    function createRegionData(selectedRegionName = '') {
        return {
            type: 'bar',
            data: {
                labels: regionData.map(region => region.name),
                datasets: [{
                    label: '各區域海岸垃圾量 (噸)',
                    data: regionData.map(region => region.trash),
                    backgroundColor: regionData.map(region =>
                        region.name === selectedRegionName ? '#ef4444' : '#38bdf8'
                    ),
                    borderColor: regionData.map(region =>
                        region.name === selectedRegionName ? '#991b1b' : '#0284c7'
                    ),
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            generateLabels: chart => {
                                const defaultLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                return defaultLabels.map(label => ({
                                    ...label,
                                    fillStyle: '#38bdf8',
                                    strokeStyle: '#0284c7'
                                }));
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.parsed.y} 噸`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: '垃圾量 (噸)' }
                    },
                    x: {
                        ticks: { maxRotation: 35, minRotation: 0 }
                    }
                }
            }
        };
    }

    const trendData = {
        type: 'bar',
        data: {
            labels: regionData.map(region => region.name),
            datasets: [{
                label: '各區域海岸垃圾量 (噸)',
                data: regionData.map(region => region.trash),
                backgroundColor: '#38bdf8',
                borderColor: '#0284c7',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, title: { display: true, text: '垃圾量 (噸)' } }, x: { ticks: { maxRotation: 35, minRotation: 0 } } } }
    };

    function renderChart(config) {
        if (currentChart) currentChart.destroy();
        currentChart = new Chart(ctx, config);
    }

    function renderRegionChart(selectedRegionName = '') {
        renderChart(createRegionData(selectedRegionName));
    }

    renderChart(compositionData);

    const btnComposition = document.getElementById('btn-composition');
    const btnTrend = document.getElementById('btn-trend');

    btnComposition.addEventListener('click', () => {
        btnComposition.classList.add('active');
        btnTrend.classList.remove('active');
        renderChart(compositionData);
    });

    btnTrend.addEventListener('click', () => {
        btnTrend.classList.add('active');
        btnComposition.classList.remove('active');
        renderRegionChart();
    });

    /* =========================================
       模組三：海廢冷知識與互動測驗 (已加入計分與動態結算)
       ========================================= */
    const quizData = [
        {
            question: "請問一個普通的「塑膠袋」在海洋中需要多久才能分解？",
            options: ["1年", "20年", "100年", "450年"],
            answer: 1, 
            fact: "一個塑膠袋大約需要 20 年才能分解，但它會碎裂成微塑膠繼續危害海洋喔！"
        },
        {
            question: "大家常喝的「寶特瓶」需要多久才能在大自然中分解？",
            options: ["50年", "100年", "450年", "永遠不會"],
            answer: 2, 
            fact: "寶特瓶需要長達 450 年才能分解！出門記得自備環保杯喔！"
        },
        {
            question: "以下哪一種海洋廢棄物被稱為「幽靈漁具」，會持續困住海洋生物？",
            options: ["塑膠吸管", "保麗龍", "廢棄漁網", "鋁罐"],
            answer: 2, 
            fact: "廢棄漁網在海中漂流時，會無差別地纏繞並殺死海龜、鯨豚等海洋生物。"
        }
    ];

    let currentQuestionIndex = 0;
    let quizScore = 0; // 🎯 新增：用來儲存答對的題數
    
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const nextBtn = document.getElementById('next-btn');
    const quizProgressText = document.getElementById('quiz-progress-text');
    const quizProgressBar = document.getElementById('quiz-progress-bar');

    function updateQuizProgress(isFinished = false) {
        const displayedQuestion = Math.min(currentQuestionIndex + 1, quizData.length);
        const progressPercent = isFinished ? 100 : (currentQuestionIndex / quizData.length) * 100;
        quizProgressText.innerText = isFinished
            ? `完成 ${quizData.length} / ${quizData.length} 題`
            : `第 ${displayedQuestion} / ${quizData.length} 題`;
        quizProgressBar.style.width = `${progressPercent}%`;
    }

    function markQuestionAnswered() {
        const answeredCount = currentQuestionIndex + 1;
        quizProgressText.innerText = `已完成 ${answeredCount} / ${quizData.length} 題`;
        quizProgressBar.style.width = `${(answeredCount / quizData.length) * 100}%`;
    }

    // 載入題目或結算畫面
    function loadQuestion() {
        feedbackMessage.innerHTML = "";
        nextBtn.style.display = "none";
        optionsContainer.innerHTML = "";
        
        // 檢查是否已經答完所有題目
        if (currentQuestionIndex >= quizData.length) {
            updateQuizProgress(true);
            questionText.innerText = "🎉 測驗挑戰結束！";
            feedbackMessage.style.color = '#1e293b';
            feedbackMessage.innerHTML = `您的最終得分為：<strong style="color: #38bdf8; font-size: 1.8rem;">${quizScore}</strong> / ${quizData.length} 題`;
            nextBtn.style.display = "inline-block";
            nextBtn.innerText = "重新測驗";
            return;
        }

        const currentQuestion = quizData[currentQuestionIndex];
        updateQuizProgress();
        // 動態秀出題號
        questionText.innerText = `【第 ${currentQuestionIndex + 1} 題】${currentQuestion.question}`;

        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerText = option;
            button.classList.add('option-btn');
            button.addEventListener('click', () => selectAnswer(index, button));
            optionsContainer.appendChild(button);
        });
    }

    // 檢查答案
    function selectAnswer(selectedIndex, selectedButton) {
        const allButtons = document.querySelectorAll('.option-btn');
        allButtons.forEach(btn => btn.style.pointerEvents = 'none'); 

        const currentQuestion = quizData[currentQuestionIndex];
        markQuestionAnswered();

        if (selectedIndex === currentQuestion.answer) {
            selectedButton.classList.add('correct');
            quizScore++; // 答對了，計分加 1 分
            feedbackMessage.style.color = '#166534';
            feedbackMessage.innerHTML = `✅ 答對了！<br><span style="font-size:1rem; font-weight:normal; color:#475569;">${currentQuestion.fact}</span>`;
        } else {
            selectedButton.classList.add('wrong');
            allButtons[currentQuestion.answer].classList.add('correct'); 
            feedbackMessage.style.color = '#991b1b';
            feedbackMessage.innerHTML = `❌ 答錯了！<br><span style="font-size:1rem; font-weight:normal; color:#475569;">${currentQuestion.fact}</span>`;
        }

        nextBtn.style.display = "inline-block";
        // 如果是最後一題，按鈕文字改為「查看結果」
        if (currentQuestionIndex === quizData.length - 1) {
            nextBtn.innerText = "查看結算結果";
        } else {
            nextBtn.innerText = "下一題";
        }
    }

    // 點擊控制按鈕
    nextBtn.addEventListener('click', () => {
        if (nextBtn.innerText === "重新測驗") {
            currentQuestionIndex = 0;
            quizScore = 0; // 重設分數統計
            loadQuestion();
        } else {
            currentQuestionIndex++;
            loadQuestion();
        }
    });

    loadQuestion();

    /* =========================================
       模組四：個人減塑計分板
       ========================================= */
    const checkboxes = document.querySelectorAll('.task-checkbox');
    const scoreDisplay = document.getElementById('total-score');
    const actionMessage = document.getElementById('action-message');
    let totalScore = 0; 

    function updateActionMessage() {
        if (totalScore >= 2) {
            actionMessage.innerText = '太棒了！你今天的減塑行動已經累積成很明顯的環境貢獻。';
        } else if (totalScore >= 1) {
            actionMessage.innerText = '做得很好，這些小選擇正在減少一次性塑膠的使用。';
        } else if (totalScore > 0) {
            actionMessage.innerText = '已經開始累積貢獻了，下一個減塑行動也很值得勾起來。';
        } else {
            actionMessage.innerText = '勾選你今天完成的減塑行動，看看能累積多少貢獻。';
        }
    }

    checkboxes.forEach(box => {
        box.addEventListener('change', function() {
            const value = parseFloat(this.value);
            if (this.checked) {
                totalScore += value;
            } else {
                totalScore -= value;
            }
            
            totalScore = Math.max(0, totalScore);
            scoreDisplay.innerText = `${totalScore.toFixed(1)} kg`;
            updateActionMessage();
        });
    });

});
