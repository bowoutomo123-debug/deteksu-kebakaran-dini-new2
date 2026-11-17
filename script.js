// =====================================================
// SISTEM MONITORING DETEKSI KEBAKARAN DINI
// WOKWI + ESP32 + MQTT + GITHUB PAGES
// =====================================================


// =====================================================
// KONFIGURASI MQTT
// =====================================================

// Gunakan WSS karena GitHub Pages menggunakan HTTPS
const MQTT_BROKER =
    "wss://broker.hivemq.com:8884/mqtt";


// =====================================================
// TOPIC MQTT
// Harus sama persis dengan sketch.ino
// =====================================================

const TOPIC_SUHU =
    "deteksi_kebakaran_dini/monitoring/suhu";

const TOPIC_KELEMBAPAN =
    "deteksi_kebakaran_dini/monitoring/kelembapan";

const TOPIC_ASAP =
    "deteksi_kebakaran_dini/monitoring/asap";

const TOPIC_API =
    "deteksi_kebakaran_dini/monitoring/api";

const TOPIC_STATUS =
    "deteksi_kebakaran_dini/status/alarm";

const TOPIC_AKTUATOR =
    "deteksi_kebakaran_dini/status/aktuator";

const TOPIC_ALL =
    "deteksi_kebakaran_dini/#";


// =====================================================
// BATAS DETEKSI
// Harus sama dengan sketch.ino
// =====================================================

const BATAS_SUHU = 45.0;
const BATAS_ASAP = 1800;


// =====================================================
// VARIABEL DATA
// =====================================================

let suhu = null;
let kelembapan = null;
let asap = 0;

let apiTerdeteksi = false;

let statusAlarm = "AMAN";

let statusAktuator = "OFF";

let espOnline = false;


// =====================================================
// AMBIL ELEMENT HTML
// =====================================================

const connectionDot =
    document.getElementById("connectionDot");

const connectionText =
    document.getElementById("connectionText");

const mainStatus =
    document.getElementById("mainStatus");

const statusIcon =
    document.getElementById("statusIcon");

const systemStatus =
    document.getElementById("systemStatus");

const statusDescription =
    document.getElementById("statusDescription");

const fireIndicator =
    document.getElementById("fireIndicator");

const houseScene =
    document.getElementById("houseScene");

const smokeContainer =
    document.getElementById("smokeContainer");

const fireContainer =
    document.getElementById("fireContainer");

const sceneMessage =
    document.getElementById("sceneMessage");

const temperature =
    document.getElementById("temperature");

const temperatureStatus =
    document.getElementById("temperatureStatus");

const humidity =
    document.getElementById("humidity");

const humidityStatus =
    document.getElementById("humidityStatus");

const smoke =
    document.getElementById("smoke");

const smokeStatus =
    document.getElementById("smokeStatus");

const flame =
    document.getElementById("flame");

const flameStatus =
    document.getElementById("flameStatus");

const redLed =
    document.getElementById("redLed");

const greenLed =
    document.getElementById("greenLed");

const buzzer =
    document.getElementById("buzzer");

const mqttStatus =
    document.getElementById("mqttStatus");

const espStatus =
    document.getElementById("espStatus");

const lastUpdate =
    document.getElementById("lastUpdate");


// =====================================================
// CEK ELEMENT
// =====================================================

console.log("========================================");
console.log("   DETEKSI KEBAKARAN DINI");
console.log("   GITHUB PAGES + WOKWI + MQTT");
console.log("========================================");

console.log(
    "MQTT Broker:",
    MQTT_BROKER
);

console.log(
    "MQTT Topic:",
    TOPIC_ALL
);


// =====================================================
// UPDATE WAKTU
// =====================================================

function updateTime() {

    const now = new Date();

    const time =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    if (lastUpdate) {
        lastUpdate.textContent =
            time;
    }
}


// =====================================================
// STATUS MQTT ONLINE
// =====================================================

function setMQTTOnline() {

    console.log(
        "✓ MQTT TERHUBUNG"
    );

    if (connectionDot) {

        connectionDot.classList.remove(
            "offline"
        );

        connectionDot.classList.add(
            "online"
        );
    }

    if (connectionText) {

        connectionText.textContent =
            "MQTT TERHUBUNG";
    }

    if (mqttStatus) {

        mqttStatus.textContent =
            "TERHUBUNG";
    }
}


// =====================================================
// STATUS MQTT OFFLINE
// =====================================================

function setMQTTOffline() {

    console.log(
        "✗ MQTT TERPUTUS"
    );

    if (connectionDot) {

        connectionDot.classList.remove(
            "online"
        );

        connectionDot.classList.add(
            "offline"
        );
    }

    if (connectionText) {

        connectionText.textContent =
            "MQTT TERPUTUS";
    }

    if (mqttStatus) {

        mqttStatus.textContent =
            "TERPUTUS";
    }
}


// =====================================================
// UPDATE STATUS UTAMA
// =====================================================

function updateMainStatus() {

    const bahaya =
        statusAlarm === "BAHAYA" ||
        apiTerdeteksi === true ||
        asap >= BATAS_ASAP ||
        (
            suhu !== null &&
            suhu >= BATAS_SUHU
        );


    // =================================================
    // BAHAYA
    // =================================================

    if (bahaya) {

        if (mainStatus) {

            mainStatus.classList.remove(
                "safe"
            );

            mainStatus.classList.add(
                "danger"
            );
        }


        if (fireIndicator) {

            fireIndicator.classList.remove(
                "safe"
            );

            fireIndicator.classList.add(
                "danger"
            );
        }


        if (houseScene) {

            houseScene.classList.add(
                "danger"
            );
        }


        if (sceneMessage) {

            sceneMessage.classList.add(
                "danger"
            );

            if (apiTerdeteksi) {

                sceneMessage.textContent =
                    "🔥 API TERDETEKSI!";

            } else if (
                asap >= BATAS_ASAP
            ) {

                sceneMessage.textContent =
                    "💨 ASAP TERDETEKSI!";

            } else if (
                suhu !== null &&
                suhu >= BATAS_SUHU
            ) {

                sceneMessage.textContent =
                    "🌡️ SUHU TERLALU TINGGI!";

            } else {

                sceneMessage.textContent =
                    "⚠️ KONDISI BAHAYA!";
            }
        }


        if (systemStatus) {

            systemStatus.textContent =
                "BAHAYA";
        }


        if (statusIcon) {

            statusIcon.textContent =
                "🔥";
        }


        if (statusDescription) {

            if (apiTerdeteksi) {

                statusDescription.textContent =
                    "Api terdeteksi oleh flame sensor.";

            } else if (
                asap >= BATAS_ASAP
            ) {

                statusDescription.textContent =
                    "Asap/gas terdeteksi oleh sensor MQ-2.";

            } else if (
                suhu !== null &&
                suhu >= BATAS_SUHU
            ) {

                statusDescription.textContent =
                    "Suhu melebihi batas aman.";

            } else {

                statusDescription.textContent =
                    "Sistem mendeteksi kondisi berbahaya.";
            }
        }

    }

    // =================================================
    // AMAN
    // =================================================

    else {

        if (mainStatus) {

            mainStatus.classList.remove(
                "danger"
            );

            mainStatus.classList.add(
                "safe"
            );
        }


        if (fireIndicator) {

            fireIndicator.classList.remove(
                "danger"
            );

            fireIndicator.classList.add(
                "safe"
            );
        }


        if (houseScene) {

            houseScene.classList.remove(
                "danger"
            );
        }


        if (sceneMessage) {

            sceneMessage.classList.remove(
                "danger"
            );

            sceneMessage.textContent =
                "✓ KONDISI LINGKUNGAN AMAN";
        }


        if (systemStatus) {

            systemStatus.textContent =
                "AMAN";
        }


        if (statusIcon) {

            statusIcon.textContent =
                "✓";
        }


        if (statusDescription) {

            statusDescription.textContent =
                "Tidak ada indikasi kebakaran.";
        }
    }
}


// =====================================================
// UPDATE ASAP
// =====================================================

function updateSmokeVisual() {

    if (
        asap >= BATAS_ASAP
    ) {

        console.log(
            "💨 Animasi asap AKTIF"
        );

        if (smokeContainer) {

            smokeContainer.classList.add(
                "active"
            );
        }

    } else {

        if (smokeContainer) {

            smokeContainer.classList.remove(
                "active"
            );
        }
    }
}


// =====================================================
// UPDATE API
// =====================================================

function updateFireVisual() {

    if (apiTerdeteksi) {

        console.log(
            "🔥 Animasi api AKTIF"
        );

        if (fireContainer) {

            fireContainer.classList.add(
                "active"
            );
        }

    } else {

        if (fireContainer) {

            fireContainer.classList.remove(
                "active"
            );
        }
    }
}


// =====================================================
// UPDATE SUHU
// =====================================================

function updateTemperature() {

    if (temperature) {

        if (
            suhu === null ||
            isNaN(suhu)
        ) {

            temperature.textContent =
                "-- °C";

        } else {

            temperature.textContent =
                suhu.toFixed(1) +
                " °C";
        }
    }


    if (temperatureStatus) {

        if (
            suhu !== null &&
            suhu >= BATAS_SUHU
        ) {

            temperatureStatus.textContent =
                "BAHAYA";

            temperatureStatus.classList.remove(
                "safe"
            );

            temperatureStatus.classList.add(
                "danger"
            );

        } else {

            temperatureStatus.textContent =
                "AMAN";

            temperatureStatus.classList.remove(
                "danger"
            );

            temperatureStatus.classList.add(
                "safe"
            );
        }
    }
}


// =====================================================
// UPDATE KELEMBAPAN
// =====================================================

function updateHumidity() {

    if (humidity) {

        if (
            kelembapan === null ||
            isNaN(kelembapan)
        ) {

            humidity.textContent =
                "-- %";

        } else {

            humidity.textContent =
                kelembapan.toFixed(1) +
                " %";
        }
    }


    if (humidityStatus) {

        humidityStatus.textContent =
            "TERBACA";

        humidityStatus.classList.remove(
            "danger"
        );

        humidityStatus.classList.add(
            "safe"
        );
    }
}


// =====================================================
// UPDATE ASAP
// =====================================================

function updateSmokeSensor() {

    if (smoke) {

        smoke.textContent =
            asap;
    }


    if (smokeStatus) {

        if (
            asap >= BATAS_ASAP
        ) {

            smokeStatus.textContent =
                "BAHAYA";

            smokeStatus.classList.remove(
                "safe"
            );

            smokeStatus.classList.add(
                "danger"
            );

        } else {

            smokeStatus.textContent =
                "AMAN";

            smokeStatus.classList.remove(
                "danger"
            );

            smokeStatus.classList.add(
                "safe"
            );
        }
    }
}


// =====================================================
// UPDATE FLAME SENSOR
// =====================================================

function updateFlameSensor() {

    if (flame) {

        if (apiTerdeteksi) {

            flame.textContent =
                "TERDETEKSI";

        } else {

            flame.textContent =
                "TIDAK TERDETEKSI";
        }
    }


    if (flameStatus) {

        if (apiTerdeteksi) {

            flameStatus.textContent =
                "BAHAYA";

            flameStatus.classList.remove(
                "safe"
            );

            flameStatus.classList.add(
                "danger"
            );

        } else {

            flameStatus.textContent =
                "AMAN";

            flameStatus.classList.remove(
                "danger"
            );

            flameStatus.classList.add(
                "safe"
            );
        }
    }
}


// =====================================================
// UPDATE AKTUATOR
// =====================================================

function updateActuator() {

    const aktif =
        statusAktuator === "ON";


    // LED MERAH

    if (redLed) {

        if (aktif) {

            redLed.textContent =
                "ON";

            redLed.classList.add(
                "on"
            );

        } else {

            redLed.textContent =
                "OFF";

            redLed.classList.remove(
                "on"
            );
        }
    }


    // LED HIJAU

    if (greenLed) {

        if (!aktif) {

            greenLed.textContent =
                "ON";

            greenLed.classList.add(
                "on"
            );

        } else {

            greenLed.textContent =
                "OFF";

            greenLed.classList.remove(
                "on"
            );
        }
    }


    // BUZZER

    if (buzzer) {

        if (aktif) {

            buzzer.textContent =
                "ON";

            buzzer.classList.add(
                "on"
            );

        } else {

            buzzer.textContent =
                "OFF";

            buzzer.classList.remove(
                "on"
            );
        }
    }
}


// =====================================================
// UPDATE ESP32
// =====================================================

function updateESPStatus() {

    if (!espStatus) {
        return;
    }


    if (espOnline) {

        espStatus.textContent =
            "ONLINE";

        espStatus.classList.remove(
            "danger"
        );

        espStatus.classList.add(
            "safe"
        );

    } else {

        espStatus.textContent =
            "MENUNGGU DATA";

        espStatus.classList.remove(
            "safe"
        );

        espStatus.classList.add(
            "danger"
        );
    }
}


// =====================================================
// UPDATE SEMUA
// =====================================================

function updateDashboard() {

    updateTemperature();

    updateHumidity();

    updateSmokeSensor();

    updateFlameSensor();

    updateActuator();

    updateSmokeVisual();

    updateFireVisual();

    updateMainStatus();

    updateESPStatus();

    updateTime();
}


// =====================================================
// PROSES DATA MQTT
// =====================================================

function handleMQTTMessage(
    topic,
    message
) {

    const data =
        message.toString().trim();


    console.log(
        "MQTT DATA:",
        topic,
        "=>",
        data
    );


    // ---------------------------------------------
    // SUHU
    // ---------------------------------------------

    if (
        topic === TOPIC_SUHU
    ) {

        const value =
            parseFloat(data);

        if (!isNaN(value)) {

            suhu = value;
        }
    }


    // ---------------------------------------------
    // KELEMBAPAN
    // ---------------------------------------------

    else if (
        topic === TOPIC_KELEMBAPAN
    ) {

        const value =
            parseFloat(data);

        if (!isNaN(value)) {

            kelembapan =
                value;
        }
    }


    // ---------------------------------------------
    // ASAP
    // ---------------------------------------------

    else if (
        topic === TOPIC_ASAP
    ) {

        const value =
            parseInt(data);

        if (!isNaN(value)) {

            asap = value;
        }
    }


    // ---------------------------------------------
    // API
    // ---------------------------------------------

    else if (
        topic === TOPIC_API
    ) {

        apiTerdeteksi =
            data.toUpperCase() ===
            "TERDETEKSI";
    }


    // ---------------------------------------------
    // STATUS ALARM
    // ---------------------------------------------

    else if (
        topic === TOPIC_STATUS
    ) {

        statusAlarm =
            data.toUpperCase();

        espOnline =
            true;
    }


    // ---------------------------------------------
    // AKTUATOR
    // ---------------------------------------------

    else if (
        topic === TOPIC_AKTUATOR
    ) {

        statusAktuator =
            data.toUpperCase();
    }


    // ---------------------------------------------
    // UPDATE
    // ---------------------------------------------

    updateDashboard();
}


// =====================================================
// BUAT CLIENT ID
// =====================================================

const clientID =
    "FireMonitoringWeb-" +
    Date.now() +
    "-" +
    Math.random()
        .toString(16)
        .substring(2);


// =====================================================
// KONEKSI MQTT
// =====================================================

console.log(
    "Mencoba koneksi MQTT..."
);

console.log(
    "Client ID:",
    clientID
);


const client =
    mqtt.connect(
        MQTT_BROKER,
        {

            clientId:
                clientID,

            clean:
                true,

            connectTimeout:
                15000,

            reconnectPeriod:
                5000,

            keepalive:
                60
        }
    );


// =====================================================
// MQTT CONNECT
// =====================================================

client.on(
    "connect",
    function () {

        console.log(
            "================================="
        );

        console.log(
            "✓ MQTT TERHUBUNG"
        );

        console.log(
            "✓ Broker HiveMQ"
        );

        console.log(
            "✓ GitHub Pages"
        );

        console.log(
            "================================="
        );


        setMQTTOnline();


        client.subscribe(
            TOPIC_ALL,
            function (error) {

                if (error) {

                    console.error(
                        "❌ Subscribe gagal:",
                        error
                    );

                } else {

                    console.log(
                        "✓ Subscribe berhasil"
                    );

                    console.log(
                        "Topic:",
                        TOPIC_ALL
                    );
                }
            }
        );
    }
);


// =====================================================
// MQTT MESSAGE
// =====================================================

client.on(
    "message",
    function (
        topic,
        message
    ) {

        handleMQTTMessage(
            topic,
            message
        );
    }
);


// =====================================================
// MQTT RECONNECT
// =====================================================

client.on(
    "reconnect",
    function () {

        console.log(
            "↻ Mencoba reconnect MQTT..."
        );
    }
);


// =====================================================
// MQTT OFFLINE
// =====================================================

client.on(
    "offline",
    function () {

        console.warn(
            "⚠ MQTT offline"
        );

        setMQTTOffline();
    }
);


// =====================================================
// MQTT CLOSE
// =====================================================

client.on(
    "close",
    function () {

        console.warn(
            "⚠ Koneksi MQTT ditutup"
        );

        setMQTTOffline();
    }
);


// =====================================================
// MQTT ERROR
// =====================================================

client.on(
    "error",
    function (error) {

        console.error(
            "❌ MQTT ERROR:",
            error
        );

        setMQTTOffline();
    }
);


// =====================================================
// UPDATE PERTAMA
// =====================================================

updateDashboard();


// =====================================================
// UPDATE JAM
// =====================================================

setInterval(
    updateTime,
    1000
);


console.log(
    "✓ JavaScript siap."
);