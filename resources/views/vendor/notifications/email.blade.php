<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <style type="text/css" rel="stylesheet" media="all">
        /* Base */
        body {
            margin: 0;
            padding: 0;
            background-color: #f5f8fa;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            -webkit-text-size-adjust: none;
            color: #2F3133;
        }

        .wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
            background-color: #f5f8fa;
        }

        .content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
        }

        /* Header */
        .header {
            padding: 25px 0;
            text-align: center;
            background-color: #ffffff;
            border-radius: 10px 10px 0 0;
            border-bottom: 3px solid #edf2f7;
        }

        .header img {
            width: 200px;
            height: auto;
            margin: 0 auto;
        }

        /* Body */
        .body {
            background-color: #ffffff;
            border-radius: 0 0 10px 10px;
            padding: 35px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        /* Typography */
        h1 {
            margin-top: 0;
            color: #2d3748;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
        }

        p {
            margin-top: 0;
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6em;
        }

        /* Buttons */
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4299e1;
            border-radius: 5px;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            transition: background-color 0.2s;
        }

        .button-green {
            background-color: #48bb78;
        }

        .button-red {
            background-color: #f56565;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            padding: 20px;
            text-align: center;
            color: #718096;
        }

        .footer p {
            font-size: 14px;
            color: #718096;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .content {
                width: 100% !important;
            }
            .button {
                width: 100% !important;
                display: block;
            }
        }
    </style>
</head>

<body>
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <img src="https://panel.anhosting.fr/logo.png" alt="{{ config('app.name') }}">
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td class="body">
                            <!-- Greeting -->
                            <h1>
                                @if (! empty($greeting))
                                    {{ $greeting }}
                                @else
                                    @if ($level == 'error')
                                        Oups !
                                    @else
                                        Bonjour !
                                    @endif
                                @endif
                            </h1>

                            <!-- Content -->
                            @foreach ($introLines as $line)
                                <p>{{ $line }}</p>
                            @endforeach

                            <!-- Action Button -->
                            @isset($actionText)
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $actionUrl }}" 
                                           class="button {{ $level == 'success' ? 'button-green' : ($level == 'error' ? 'button-red' : '') }}"
                                           target="_blank">
                                            {{ $actionText }}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            @endisset

                            <!-- Additional Content -->
                            @foreach ($outroLines as $line)
                                <p>{{ $line }}</p>
                            @endforeach

                            <!-- Salutation -->
                            <p style="text-align: center; margin-top: 30px;">
                                Cordialement,<br>
                                L'équipe {{ config('app.name') }}
                            </p>

                            <!-- Sub Copy -->
                            @isset($actionText)
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td>
                                        <p style="font-size: 13px; color: #718096; text-align: center; margin-top: 30px;">
                                            Si vous ne parvenez pas à cliquer sur le bouton "{{ $actionText }}",<br>
                                            copiez et collez l'URL ci-dessous dans votre navigateur :<br>
                                            <a href="{{ $actionUrl }}" style="color: #4299e1;">{{ $actionUrl }}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            @endisset
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td>
                            <table class="footer" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center">
                                        <p>
                                            © {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
