$base='"http://localhost:5001"'
Write-Host 'Listing forms...'
try { Invoke-RestMethod -Uri "$($base)/api/PollingAndSurvey?limit=5" -Method Get | ConvertTo-Json -Depth 5 } catch { Write-Host "List failed: $_" }
$body = @{ title='Smoke Test Poll'; type='poll'; questions=@(@{ text='Q1'; options=@('A','B','C') }) }
Write-Host 'Creating poll...'
try { $r = Invoke-RestMethod -Uri "$($base)/api/PollingAndSurvey" -Method Post -Body ($body | ConvertTo-Json -Depth 5) -ContentType 'application/json'; $r | ConvertTo-Json -Depth 5; $id = $r._id } catch { Write-Host "Create failed: $_" }
if ($id) {
  Write-Host "Submitting response to $id..."
  $resp = @{ user='SmokeTester'; answers=@('A') }
  try { Invoke-RestMethod -Uri "$($base)/api/PollingAndSurvey/$id/responses" -Method Post -Body ($resp | ConvertTo-Json -Depth 5) -ContentType 'application/json' | ConvertTo-Json -Depth 5 } catch { Write-Host "Submit failed: $_" }
} else { Write-Host 'No id from create, skipping submit.' }
