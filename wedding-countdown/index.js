// This is the entry point for your Cloudflare Worker.
export default {
  async fetch(request, env, ctx) {
    // We will serve the same HTML response for all requests.
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  },
};

// This is the complete HTML document that will be sent to the user.
// It includes the styles (CSS) and the countdown logic (JavaScript) inside.
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Taha & Munazza's Wedding Countdown</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-font: 'Montserrat', sans-serif;
            --fancy-font: 'Great Vibes', cursive;
            --background-color: #fdf6f7; /* A very light pink */
            --text-color: #333;
            --primary-color: #d4a5a5; /* A dusty rose */
            --card-background: #ffffff;
            --shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        body {
            font-family: var(--primary-font);
            background-color: var(--background-color);
            color: var(--text-color);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }

        .container {
            text-align: center;
            background: var(--card-background);
            padding: 40px 50px;
            border-radius: 20px;
            box-shadow: var(--shadow);
            width: 100%;
            max-width: 600px;
        }

        h1 {
            font-family: var(--fancy-font);
            font-size: 4.5rem;
            color: var(--primary-color);
            margin: 0;
            font-weight: 400;
        }

        h2 {
            font-size: 1.2rem;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-top: 10px;
            margin-bottom: 40px;
            font-weight: 300;
        }

        #countdown {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 40px;
        }

        .time-unit {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 10px;
            min-width: 90px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            flex-basis: 100px; /* Gives a base size but allows shrinking */
            flex-grow: 1; /* Allows units to grow if there is space */
        }

        .time-unit span {
            display: block;
        }

        .time-unit .number {
            font-size: 2.5rem;
            font-weight: 400;
            color: var(--primary-color);
        }

        .time-unit .label {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
        }

        .message {
            font-size: 1.1rem;
            line-height: 1.6;
            font-weight: 300;
        }
        
        .heart {
            color: var(--primary-color);
            font-size: 1.2rem;
        }

        /* --- THIS IS THE NEW PART FOR MOBILE RESPONSIVENESS --- */
        @media (max-width: 600px) {
            h1 {
                font-size: 3rem; /* Smaller heading */
            }

            h2 {
                font-size: 1rem;
            }

            .container {
                padding: 30px 20px; /* Less horizontal padding */
            }

            #countdown {
                gap: 10px; /* Reduced gap between boxes */
            }

            .time-unit {
                padding: 10px 5px; /* Smaller boxes */
                min-width: 65px; /* Allow boxes to be narrower */
            }

            .time-unit .number {
                font-size: 2rem; /* Smaller numbers */
            }

            .time-unit .label {
                font-size: 0.7rem;
            }

            .message {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>Taha & Munazza</h1>
        <h2>Are Getting Married</h2>
        <div id="countdown">
            </div>
        <p class="message">
            Counting down the moments to our wedding on December 29th, 2025, the most beautiful day of our lives. <br>
            Then, we begin our greatest adventure together in the UK! <span class="heart">♡</span>
        </p>
    </div>

    <script>
        // The date we are counting down to.
        // Using 'YYYY-MM-DDTHH:mm:ssZ' format is safer to avoid timezone issues.
        const weddingDate = new Date('2025-12-29T00:00:00Z').getTime();

        const countdownElement = document.getElementById('countdown');

        // Update the countdown every 1 second
        const countdownInterval = setInterval(() => {
            // Get today's date and time (in milliseconds)
            const now = new Date().getTime();

            // Find the distance between now and the wedding date
            const distance = weddingDate - now;

            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // If the countdown is over, display a message
            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownElement.innerHTML = "<h2>Happily Ever After!</h2>";
                return;
            }

            // Display the result in the element with id="countdown"
            countdownElement.innerHTML = \`
                <div class="time-unit">
                    <span class="number">\${days}</span>
                    <span class="label">Days</span>
                </div>
                <div class="time-unit">
                    <span class="number">\${hours}</span>
                    <span class="label">Hours</span>
                </div>
                <div class="time-unit">
                    <span class="number">\${minutes}</span>
                    <span class="label">Minutes</span>
                </div>
                <div class="time-unit">
                    <span class="number">\${seconds}</span>
                    <span class="label">Seconds</span>
                </div>
            \`;
        }, 1000);
    </script>

</body>
</html>
`;