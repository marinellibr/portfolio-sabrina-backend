const { Router } = require('express');

const router = Router();

const files = {
  pt: {
    fileName: 'cv_sabrina_cardoso.pdf',
    url: 'https://raw.githubusercontent.com/marinellibr/portfolio-sabrina-resources/main/docs/cv_sabrina_cardoso.pdf',
  },
  en: {
    fileName: 'sabrina_cardoso_cv.pdf',
    url: 'https://raw.githubusercontent.com/marinellibr/portfolio-sabrina-resources/main/docs/sabrina_cardoso_cv.pdf',
  },
};

router.get('/:lang', async (req, res, next) => {
  try {
    const file = files[req.params.lang] || files.pt;
    const response = await fetch(file.url);

    if (!response.ok) {
      return res.redirect(302, file.url);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${file.fileName}"`,
      'Cache-Control': 'public, max-age=3600',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
