## Image Slot Requirements

These filenames now use the **required replacement size for the UI slot**.

Example:

`shared-board-background__required-2400x520.jpg`

This means:

- `shared-board-background` = where the image is used
- `required-2400x520` = the recommended image canvas size you should prepare when replacing it

The `required` size is **not** the current file's original size.
It is the target size for that screen location.

You can use the same size or any larger size with the same aspect ratio.

## Replace These Files

`/images/usage/board/shared-board-background__required-2400x520.jpg`
Used in: background behind the full shared board
Purpose: should visually fill the long horizontal board area

`/images/usage/player-panels/queen-player-card__required-1600x340.jpg`
Used in: queen player card at the bottom
Purpose: wide card image behind the queen panel

`/images/usage/player-panels/king-player-card__required-1600x340.jpg`
Used in: king player card at the bottom
Purpose: wide card image behind the king panel

`/images/usage/task-popup/task-popup-female-performer__required-1600x740.jpg`
Used in: task popup fallback image when female performer card is shown
Purpose: task card hero image

`/images/usage/task-popup/task-popup-male-performer__required-1600x740.jpg`
Used in: task popup fallback image when male performer card is shown
Purpose: task card hero image

`/images/usage/hero/landing-hero-couple__required-1200x1600.jpg`
Used in: landing screen hero image
Purpose: full landing section image

`/images/usage/branding/logo-heart__required-512x512.jpg`
Used in: landing screen logo
Purpose: square logo image

## Notes

If the same artwork is shown in different places, those places now have separate files.
That lets you replace one screen's image without affecting another screen.

If you want an image to look full inside its area, prepare the new image close to the slot size written in the filename.

Custom task images that come from task data are still separate from these fallback files.
