@echo off
echo Testing Room Sections API Endpoints
echo =====================================

echo.
echo 1. Testing time slots endpoint...
curl -s -X GET http://localhost:5001/api/rooms/time-slots

echo.
echo.
echo 2. Testing room creation with sections...
curl -s -X POST http://localhost:5001/api/rooms ^
  -H "Content-Type: application/json" ^
  -d "{\"room_name\": \"Test CS Room\", \"description\": \"Test room with sections\", \"sections\": [{\"sectionNumber\": 1, \"classTimings\": [{\"day\": \"Saturday\", \"startTime\": \"8:00 AM\", \"endTime\": \"9:20 AM\"}, {\"day\": \"Monday\", \"startTime\": \"11:00 AM\", \"endTime\": \"12:20 PM\"}]}, {\"sectionNumber\": 2, \"classTimings\": [{\"day\": \"Sunday\", \"startTime\": \"9:30 AM\", \"endTime\": \"10:50 AM\"}, {\"day\": \"Tuesday\", \"startTime\": \"2:00 PM\", \"endTime\": \"3:20 PM\"}]}, {\"sectionNumber\": 3, \"classTimings\": [{\"day\": \"Monday\", \"startTime\": \"8:00 AM\", \"endTime\": \"9:20 AM\"}, {\"day\": \"Wednesday\", \"startTime\": \"12:30 PM\", \"endTime\": \"1:50 PM\"}]}, {\"sectionNumber\": 4, \"classTimings\": [{\"day\": \"Tuesday\", \"startTime\": \"11:00 AM\", \"endTime\": \"12:20 PM\"}, {\"day\": \"Thursday\", \"startTime\": \"3:30 PM\", \"endTime\": \"4:50 PM\"}]}, {\"sectionNumber\": 5, \"classTimings\": [{\"day\": \"Wednesday\", \"startTime\": \"9:30 AM\", \"endTime\": \"10:50 AM\"}, {\"day\": \"Thursday\", \"startTime\": \"8:00 AM\", \"endTime\": \"9:20 AM\"}]}]}"

echo.
echo.
echo 3. Getting all rooms to verify creation...
curl -s -X GET http://localhost:5001/api/rooms

echo.
echo.
echo Test completed! Check the above output for results.
echo If you see JSON responses, the endpoints are working correctly.

pause
