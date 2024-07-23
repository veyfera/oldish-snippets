## Getting Started

First, run the development server:

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# card-game-engine v0.0.1

## features
* rectangle size can be easily changed in `/app/variables.modules.scss`
* border collision so rectangles don't get positioned outside the game field
* simple to modify the code to accept different images for each rectangle

## improvements for next versions
* implement touch support
* add form validation and decide on method for submitting it 
* work on styling of the website


## notes
* Used 'react-dnd' for 'drag and drop' functionality. Initially I made it using native drag and drop, but later I discovered that cross browser compatibility is meh and the small visual quicks are time consuming to deal with 
* css properties 'left', 'top', 'animation' are used for the rectangle animation and positioning, it helped make the code intuitive to work with (same as the usual x,y coordinate system) and the wide range of readymade css animations is IMHO one of the big advantages of using browsers for gamedev
*

