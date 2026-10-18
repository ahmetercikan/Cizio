/**
 * Sayfaları önceden hazırlama.
 *
 * Çizio Adası'nın paketi (three.js ile ~750 KB) her açılışta boşta yükleniyordu; adaya hiç girmeyen
 * bir çocuk için bu boşa harcanan bir saniyelik işlemci zamanı ve onlarca MB bellek demekti. Artık
 * yalnızca ada kartına dokunulduğunda hazırlanır — adanın kendi açılışı zaten birkaç saniye sürdüğü
 * için bekleme hissedilmez.
 */
let adaIstendi = false;

export function preloadWorld() {
  if (adaIstendi) return;
  adaIstendi = true;
  void import('../pages/World').catch(() => {
    adaIstendi = false;
  });
}
