# Gera capturas de tela do site em varios tamanhos de tela (celular, tablet, notebook, desktop).
# Uso: clique com o botao direito > "Executar com PowerShell", ou rode:  .\testar-telas.ps1
# As imagens ficam na pasta "capturas" dentro do projeto.

$ErrorActionPreference = "Stop"

# Localiza Microsoft Edge ou Google Chrome
$navegador = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $navegador) { throw "Edge ou Chrome nao encontrado." }

$projeto = $PSScriptRoot
$saida = Join-Path $projeto "capturas"
$temp = Join-Path $env:TEMP "memento-mori-teste"
New-Item -ItemType Directory -Force -Path $saida, $temp | Out-Null

$indexUrl = "file:///" + ((Join-Path $projeto "index.html") -replace '\\', '/')
$html = Get-Content (Join-Path $projeto "index.html") -Raw -Encoding UTF8

# Telas a testar: nome, largura, altura
$telas = @(
  @{ nome = "celular-pequeno";  w = 360;  h = 740 },
  @{ nome = "celular";          w = 390;  h = 844 },
  @{ nome = "tablet-retrato";   w = 768;  h = 1024 },
  @{ nome = "tablet-paisagem";  w = 1024; h = 768 },
  @{ nome = "notebook";         w = 1366; h = 768 },
  @{ nome = "desktop";          w = 1920; h = 1080 }
)

# Abas a capturar: nome, codigo a executar ao abrir
$abas = @(
  @{ nome = "configurar"; codigo = 'document.getElementById("nascimento").value = "1990-05-15"; atualizarPrevia(); trocarAba("config");' },
  @{ nome = "visualizar"; codigo = 'document.getElementById("nascimento").value = "1990-05-15"; trocarAba("previa");' }
)

$total = 0
foreach ($aba in $abas) {
  # Cria uma copia da pagina que ja preenche dados e abre a aba desejada
  $copia = $html.Replace('trocarAba("config");', $aba.codigo)
  $arquivoPagina = Join-Path $temp ("pagina-" + $aba.nome + ".html")
  Set-Content -Path $arquivoPagina -Value $copia -Encoding UTF8
  $urlPagina = "file:///" + ($arquivoPagina -replace '\\', '/')

  foreach ($tela in $telas) {
    # Moldura com iframe do tamanho exato da tela (simula o aparelho)
    $moldura = Join-Path $temp ("moldura-" + $aba.nome + "-" + $tela.nome + ".html")
    Set-Content -Path $moldura -Encoding UTF8 -Value "<!DOCTYPE html><html><body style='margin:0'><iframe src='$urlPagina' width='$($tela.w)' height='$($tela.h)' style='border:0'></iframe></body></html>"
    $urlMoldura = "file:///" + ($moldura -replace '\\', '/')
    $arquivoImg = Join-Path $saida ("{0}_{1}_{2}x{3}.png" -f $tela.nome, $aba.nome, $tela.w, $tela.h)

    & $navegador --headless=new --disable-gpu --no-sandbox --virtual-time-budget=6000 `
      "--window-size=$($tela.w + 20),$($tela.h + 20)" "--screenshot=$arquivoImg" $urlMoldura 2>$null | Out-Null

    if (Test-Path $arquivoImg) { $total++ }
  }
}

Write-Host ""
Write-Host "$total capturas geradas em: $saida"
Start-Process explorer.exe $saida
