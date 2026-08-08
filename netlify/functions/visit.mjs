const EMAIL_TO = "eltiopiki@gmail.com";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeText(value, fallback = "No disponible") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).slice(0, 500);
}

function getSourceLabel(source, browser) {
  const cleanSource = String(source || "").toLowerCase();
  const cleanBrowser = String(browser || "").toLowerCase();

  if (cleanSource.includes("instagram") || cleanBrowser.includes("instagram")) {
    return "📸 Instagram";
  }

  if (cleanSource.includes("facebook")) {
    return "🔵 Facebook";
  }

  if (cleanSource === "direct") {
    return "🌐 Acceso directo";
  }

  return `🌐 ${safeText(source)}`;
}

export default async (request, context) => {
  if (request.method !== "POST") {
    return Response.json(
      {
        ok: false,
        message: "Método no permitido",
      },
      {
        status: 405,
      },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error("Falta RESEND_API_KEY.");

    return Response.json(
      {
        ok: false,
        message: "Configuración de correo incompleta",
      },
      {
        status: 500,
      },
    );
  }

  try {
    const data = await request.json();

    const geo = context.geo || {};

    const source = safeText(data.source, "direct");
    const browser = safeText(data.browser);
    const sourceLabel = getSourceLabel(source, browser);

    const country = safeText(geo.country?.name || geo.country?.code);

    const region = safeText(geo.subdivision?.name || geo.subdivision?.code);

    const city = safeText(geo.city);

    const timezone = safeText(geo.timezone);

    const page = safeText(data.page, "/");
    const pageTitle = safeText(data.pageTitle);
    const medium = safeText(data.medium);
    const campaign = safeText(data.campaign);
    const referrer = safeText(data.referrer);
    const device = safeText(data.device);
    const language = safeText(data.language);
    const localDate = safeText(data.localDate);

    const screen =
      data.screenWidth && data.screenHeight
        ? `${data.screenWidth} × ${data.screenHeight}`
        : "No disponible";

    const viewport =
      data.viewportWidth && data.viewportHeight
        ? `${data.viewportWidth} × ${data.viewportHeight}`
        : "No disponible";

    const serverDate = new Date().toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const isInstagram =
      source.toLowerCase().includes("instagram") ||
      browser.toLowerCase().includes("instagram");

    const subject = isInstagram
      ? "📸 Nueva visita desde Instagram"
      : "🌍 Nueva visita en tu galería";

    const html = `
      <div
        style="
          font-family: Arial, Helvetica, sans-serif;
          max-width: 650px;
          margin: 0 auto;
          color: #222222;
        "
      >
        <h2 style="margin-bottom: 5px;">
          ${escapeHtml(subject)}
        </h2>

        <p style="margin-top: 0; color: #666666;">
          Alguien acaba de entrar en tu galería de fotografías.
        </p>

        <table
          style="
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
          "
        >
          <tbody>
            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Procedencia
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(sourceLabel)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Medio
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(medium)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Campaña
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(campaign)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                País
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(country)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Región aproximada
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(region)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Ciudad aproximada
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(city)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Dispositivo
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(device)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Navegador
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(browser)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Idioma
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(language)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Pantalla
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(screen)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Área visible
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(viewport)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Página
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(pageTitle)}
                <br />
                <small>${escapeHtml(page)}</small>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Referrer
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  word-break: break-all;
                "
              >
                ${escapeHtml(referrer)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Hora del visitante
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(localDate)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Hora España
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(serverDate)}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                  font-weight: bold;
                "
              >
                Zona horaria aproximada
              </td>
              <td
                style="
                  padding: 10px;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                ${escapeHtml(timezone)}
              </td>
            </tr>
          </tbody>
        </table>

        <p
          style="
            margin-top: 25px;
            font-size: 12px;
            color: #888888;
          "
        >
          Este aviso no incluye la dirección IP del visitante ni intenta
          identificar personalmente a la persona.
        </p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Galería Raimon <onboarding@resend.dev>",
        to: [EMAIL_TO],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();

      console.error("Error enviando correo con Resend:", resendError);

      return Response.json(
        {
          ok: false,
          message: "No se pudo enviar el aviso",
        },
        {
          status: 500,
        },
      );
    }

    return Response.json({
      ok: true,
    });
  } catch (error) {
    console.error("Error registrando visita:", error);

    return Response.json(
      {
        ok: false,
        message: "Error interno",
      },
      {
        status: 500,
      },
    );
  }
};
