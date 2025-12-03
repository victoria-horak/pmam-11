Clear-Host
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "        SYSTEM MONITOR         " -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

function Draw-Bar {
    param(
        [int]$percent,
        [int]$length = 30
    )

    $filled = [math]::Round($percent * $length / 100)
    $empty = $length - $filled

    $bar = ("#" * $filled) + ("." * $empty)
    Write-Host ("[" + $bar + "] " + $percent + "%")
}

# CPU Usage
$cpu = Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average
Write-Host "CPU Load:" -ForegroundColor Yellow
Draw-Bar -percent $cpu.Average

# RAM Usage
$mem = Get-CimInstance Win32_OperatingSystem
$used = ($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory)
$total = $mem.TotalVisibleMemorySize
$ramPercent = [math]::Round($used * 100 / $total)

Write-Host "RAM Usage:" -ForegroundColor Yellow
Draw-Bar -percent $ramPercent

# Top 5 CPU processes
Write-Host ""
Write-Host "Top 5 CPU consuming processes:" -ForegroundColor Yellow
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | Format-Table -AutoSize Id, ProcessName, CPU

# Save report option
$save = Read-Host "Save report to file? (y/n)"
if ($save -eq "y") {
    $reportFile = "system_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    $report = @()
    $report += "CPU Load: $($cpu.Average)%"
    $report += "RAM Usage: $ramPercent%"
    $report += "Top 5 CPU processes:"
    $report += (Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | Format-Table -AutoSize | Out-String)
    $report | Out-File $reportFile
    Write-Host "Report saved to $reportFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Done."
