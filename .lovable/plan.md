
# Make Phone Mockup Much Bigger

## What Changes
- Increase the phone image width from `w-72 md:w-96 lg:w-[420px]` to `w-96 md:w-[500px] lg:w-[600px]`
- Increase the container height from `h-[450px] md:h-[550px]` to `h-[500px] md:h-[650px]` so there's more visible area while still clipping the bottom
- Scale up the "SCHEDULE MIDNIGHT ORDER" card and icon to match the larger phone
- Adjust feature card positioning to stay aligned with the bigger phone

## Technical Details
- **Phone size**: `w-96 md:w-[500px] lg:w-[600px]` (roughly 40-50% larger)
- **Container height**: `h-[500px] md:h-[650px]` to keep the "half phone cut off" effect
- **Center card**: Increase padding and width (`w-48 md:w-60`) with larger icon (`w-16 h-16`)
