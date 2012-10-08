var app = { fps: 30, forceFactor: 0.1 }

//draw, select, setcolor
var mode = 'select' 
var currentTouches = []
    /* SETUP */


    var setupCanvas = function() {
        app.canvas = $('#mainCanvas')
        paper.setup(app.canvas[0])
        
        //app.v1 = paper.
        //app.v2 = new paper.View('touchVizCanvas')
        //app.v2.activate()
        //var l = paper.Path.Line(new paper.Point(0, 0), new paper.Point(1200, 1200))
        //l.strokeWidth = 5
        //l.strokeColor = new paper.HsbColor(0,0,0)
        setupSeesaw(0)
        setupCursor()
        draw()
    }
    

   /* DRAWING STUFF */

    var createPath = function() {
        var path = new paper.Path()
        var color = new paper.HsbColor(Math.round(Math.random()*359), 0.9, 0.7)
        path.fillColor = color
        return path
    }

    var drawSegment = function(touch) {
        
        if (touch.path == null) {
            touch.path = new paper.Path()
            touch.path.fillColor = new paper.HsbColor(Math.round(Math.random()*359), 0.9, 0.7)
        }

        var path = touch.path
        var newPoint = new paper.Point(touch.x, touch.y)
        var prevTouch = new paper.Point(touch.lastX, touch.lastY)

        if (prevTouch == null || prevTouch.getDistance(newPoint, true) == 0) {
            path.add(newPoint)
        
        } else {
            var oldPoint = new paper.Point(prevTouch.x, prevTouch.y)

            var delta = newPoint.subtract([oldPoint.x, oldPoint.y])
            //var middlePoint = newPoint.subtract([delta.x/2, delta.y/2])
            var step = delta.divide(2)
            var middlePoint = newPoint.subtract(step)
            step.angle += 90        

            var factor = touch.forceAverage * app.forceFactor
            //console.log(touch.f)

            var top = middlePoint.add(step.multiply(factor))
            var bottom = middlePoint.subtract(step.multiply(factor))

            path.add(top)
            path.insert(0, bottom)
            path.smooth()

            
        }
    }   

    var setupSeesaw = function(value){
        var pos = new paper.Point(10,0)
        var size = new paper.Point(200,20)
        var bg = new paper.Path.RoundRectangle(new paper.Rectangle(pos, pos.add(size)), new paper.Size(3, 3))
        bg.fillColor = new paper.HsbColor(0, 0, 0.7)
        var margin = 2
        var inner = new paper.Path.Rectangle(pos.add([margin,margin]), pos.add(size).subtract([margin,margin]))
        inner.fillColor = new paper.HsbColor(0, 0, 1)
        //baseline
        var b1 = new paper.Point(pos.x+4*margin, pos.y+size.y/2)
        var b2 = new paper.Point(pos.x + size.x - 4*margin, pos.y+size.y/2)
        var baseline = new paper.Path.Line(b1, b2)
        baseline.strokeWidth = 0.5
        baseline.strokeColor = new paper.HsbColor(0,0,0.5)
        //pivot indicator
        var width = (pos.x + size.x - 4*margin) - (pos.x +4*margin)
        var pivotOffset = (width/2) * (value+1)
        var pt1 = new paper.Point(pos.x+pivotOffset+4*margin, pos.y+2*margin)
        var pt2 = new paper.Point(pos.x+pivotOffset+4*margin, pos.y + size.y - +2*margin)
        var line = new paper.Path.Line(pt1, pt2)
        line.strokeWidth = 2
        line.strokeColor = new paper.HsbColor(0,1,0.7)
        app.seesaw = new paper.Group([bg, inner, baseline, line])
        app.seesaw.pivot = line
        app.seesaw.w = width
        app.seesaw.pos = pos
        app.seesaw.sz = size
        app.seesaw.opacity = 0
    }

    var drawSeesaw = function(value){
        app.seesaw.opacity = 1
        var margin = 2
        var pivotOffset = (app.seesaw.w/2) * (value+1)
        var x = app.seesaw.pos.x + pivotOffset+4*margin
        app.seesaw.pivot.segments[0].point.x = x
        app.seesaw.pivot.segments[0].point.y = app.seesaw.pos.y+2*margin
        app.seesaw.pivot.segments[1].point.x = x
        app.seesaw.pivot.segments[1].point.y = app.seesaw.pos.y+app.seesaw.sz.y - +2*margin
    }

    var hideSeesaw = function() {
        app.seesaw.opacity = 0
    }
    
    var setupCursor = function() {
        var pos = new paper.Point(0,0)
        var radius = 5
        var bg = new paper.Path.Circle(pos, radius)
        bg.name = 'bg'
        bg.fillColor = new paper.HsbColor(0,0,0);
        bg.opacity = 0.2
        var dot = new paper.Path.Circle(pos, 1)
        dot.fillColor = new paper.HsbColor(0,0,0);
        app.cursor = new paper.Group([bg, dot])
        app.cursor.opacity = 0
        app.cursor.scale = 1
    }

    var drawCursor = function() {
        if (currentTouches.length > 0){
            app.cursor.opacity = 1
            app.cursor.position.setX(currentTouches[0].x)
            app.cursor.position.setY(currentTouches[0].y)
            var newscale = 1 + 0.1*currentTouches[0].forceAverage
            console.log(currentTouches[0].forceAverage)
            app.cursor.children['bg'].scale(newscale/app.cursor.scale)
            app.cursor.scale = newscale
        }        
    }


    var draw = function() {
        $('#msg-list .msg').html(printTouches())
        if (currentTouches.length >= 2) {
            drawSeesaw(getPressureBalance(currentTouches[0], currentTouches[1]))
        } else {
            hideSeesaw()
        }
        paper.view.draw()
    }


/* TOUCH STUFF */
    var bounds = {
        c: 0,
        x: {min: 0, max: 0, sum:0, avg: 0},
        y: {min: 0, max: 0, sum:0, avg: 0},
        f: {min: 0, max: 0, sum:0, avg: 0},
        s: {min: 0, max: 0, sum:0, avg: 0},
        f2: {min: 0, max: 0, sum:0, avg: 0},
        sdk:{x_min:1374, x_max: 5538, y_min: 1324, y_max: 4464}
    }

    //track the upper and lower bounds of incoming variables. Helps us determine true input dimensions
    var findBounds = function(data){
      var old = bounds;
      bounds.c++
      changed = false
      if(data[0][0] < bounds.x.min) { bounds.x.min = data[0][0]; changed = true;}
      if(data[0][1] < bounds.y.min) { bounds.y.min = data[0][1]; changed = true;}
      if(data[0][2] < bounds.f.min) { bounds.f.min = data[0][2]; changed = true;}
      if(data[0][3] < bounds.s.min) { bounds.s.min = data[0][3]; changed = true;}
      if(data[0][4] < bounds.f2.min) { bounds.f2.min = data[0][4]; changed = true;}
      
      if(data[0][0] > bounds.x.max) { bounds.x.max = data[0][0]; changed = true;}
      if(data[0][1] > bounds.y.max) { bounds.y.max = data[0][1]; changed = true;}
      if(data[0][2] > bounds.f.max) { bounds.f.max = data[0][2]; changed = true;}
      if(data[0][3] > bounds.s.max) { bounds.s.max = data[0][3]; changed = true;}
      if(data[0][4] > bounds.f2.max) { bounds.f2.max = data[0][4]; changed = true;}

      bounds.x.sum += data[0][0]
      bounds.y.sum += data[0][1]
      bounds.f.sum += data[0][2]
      bounds.s.sum += data[0][3]
      bounds.f2.sum += data[0][4]

      bounds.x.sum = bounds.x.sum / bounds.c
      bounds.y.avg = bounds.y.sum / bounds.c
      bounds.f.avg = bounds.f.sum / bounds.c
      bounds.s.avg = bounds.s.sum / bounds.c
      bounds.f2.avg = bounds.f2.sum / bounds.c

      if (changed) {
        //console.log(bounds)
      }
    }


    //returns -1..1 balance (for 'seesaw' interaction)
    var getPressureBalance = function(touch1, touch2) {
        var res = 2*touch1.forceAverage / (touch1.forceAverage + touch2.forceAverage) - 1
        //switch direction if touch1 is to the right of touch2
        if (touch2.x - touch1.x > 10) {
            res *= -1
        }
        return (res != null) ? res : 0
    } 

    var drawPathFromTouches = function(){
        for (i = 0; i < currentTouches.length; i++){
            drawSegment(currentTouches[i])
        }
        /*var i = 0
        _(currentTouches).each(function(touch){
            var prevTouch = currentTouches[i]
            if(prevTouch != null ) {
                drawSegment(prevTouch)
            }
            i++
        })*/
    }

    var getCurrentTouchByID = function(id) {
        for(i = 0; i< currentTouches.length; i++){
            if (currentTouches[i].id == id) {
                return currentTouches[i]
            } 
        }
        return null
    }

    var removeOldTouches = function(data) {
        toBeRemoved = []
        _(currentTouches).each(function(touch){
            var matchcount = 0
            _(data).each(function(rawtouch){
                
                if (rawtouch[0] === touch.id) { matchcount++ }
            })
            if (matchcount===0) {
                toBeRemoved.push(touch)
            }
        })
        /*if (toBeRemoved.length>0) {
            console.log('removing %d old touches', toBeRemoved.length)
        }*/
        _(toBeRemoved).each(function(oldTouch){
            currentTouches = _(currentTouches).without(oldTouch)
        })
    }

    var scaleInput = function(data) {
        var forceHistorySize = 10
        conversions = {
                x: {min: 1000, max: 5800, target: app.canvas.width()},
                y: {min: 1200, max: 4700, target: app.canvas.height()},
                f: {min: 0, max: 500, target: {low: 1, high:100}},
                s: {min: 0, max: 100, target: 100},
                f2: {min: 0, max: 500, target: 100},
                maxAvgForce: 250
            }
        _(data.f).each(function(rawtouch){
            var t = {}
            var test = getCurrentTouchByID(rawtouch[0])
            if (test != null) {
                t = test
                t.lastX = t.x
                t.lastY = t.y
            } else {
                t.id = rawtouch[0]
                t.counter = 0
                t.forceHistory = []
            }
            //x, y, f: raw force, s: touch size, f2: filtered force
            t.x = (rawtouch[1] - conversions.x.min) / (conversions.x.max - conversions.x.min) * conversions.x.target
            t.y = (conversions.y.max - rawtouch[2]) / (conversions.y.max - conversions.y.min) * conversions.y.target
            t.f = Math.max(conversions.f.target.low,(Math.max(rawtouch[3],0) - conversions.f.min) / (conversions.f.max - conversions.f.min) * (conversions.f.target.high - conversions.f.target.low) + conversions.f.target.low)
            //t.f = Math.max(data.f[0][2],conversions.f.min) / (conversions.f.max - conversions.f.min) * conversions.f.target
            t.s = (Math.max(rawtouch[4],0) - conversions.s.min) / (conversions.s.max - conversions.s.min) * conversions.s.target
            t.f2 = (Math.max(rawtouch[5],0) - conversions.f2.min) / (conversions.f2.max - conversions.f2.min) * conversions.f2.target
            
            t.forceHistory[t.counter % forceHistorySize] = t.f
            t.forceAverage =  Math.min( _.reduce(t.forceHistory, function(i, m){return m+i})/forceHistorySize, conversions.maxAvgForce)

            

            t.counter++
            if (test == null) {                
                t.lastX = t.x
                t.lastY = t.y
                currentTouches.push(t)
            }
        })

    }

    /* HELPERS */

    //costruct html table string for touch matrix outout
    var printTouches = function () {
        var p = 1 //number output precision
        var table = '<table><tr><td>id</td><td>x</td><td>y</td><td>f</td><td>s</td><td>f2</td></tr>'
        _(currentTouches).each(function(touch){
            table += '<tr><td>' + touch.id + '</td>'
            table += '<td>' + (touch != null ? touch.x.toFixed(p) : '') + '</td>'
            table += '<td>' + (touch != null ? touch.y.toFixed(p) : '') + '</td>'
            table += '<td>' + (touch != null ? touch.f.toFixed(p) : '') + '</td>'
            table += '<td>' + (touch != null ? touch.s.toFixed(p) : '') + '</td>'
            table += '<td>' + (touch != null ? touch.f2.toFixed(p) : '')
        })
        table += '</table>'

        return table
    }

    //return string representation of touch
    var touchToStr = function(touch) {
        var p = 1
        return  "" + 
                touch.x.toFixed(p) + ', '+
                touch.y.toFixed(p)+ ', '+
                touch.f.toFixed(p)+ ', '+
                touch.s.toFixed(p)+ ', '+
                touch.f2.toFixed(p)
    }


    /* UI STUFF */
    var setAppMode = function (modestring){
        mode = modestring
        console.log(mode)
        $('.navbar li.active').removeClass('active')
        switch(mode) {
            case 'draw':  $('#linkModeDraw').addClass('active') ;break;
            case 'select':  $('#linkModeSelect').addClass('active') ;break;
        }
    }

    var toggleVisibility = function(id) {
        var element = $('#'+id)
        if (element.css('display') === 'none') {
            element.show()
        } else
        element.hide()
    }



$(document).ready(function(){

    
    setupCanvas()
    //setupPaths()
    setInterval(draw, 1000/app.fps)
    //simulateDrawing()
    
    
    /* non-socket EVENTS */
    $('#msg-list').draggable({ cursor: "crosshair" });

    
    /* WEBSOCKET STUFF */
    
    var c_in = 0
    var msgPerSec = function() {
        if (c_in > 0)
        console.log('messages/sec: ', c_in)
        c_in = 0
    }
    setInterval(msgPerSec, 1000)

    var ws = new WebSocket("ws://192.168.56.101:9002/")
    ws.onopen = function() {
        console.log('onOpen')
        ws.send("Hello Mr. Server!")
    }
    ws.onmessage = function (e) {
        //console.log(e.data)
        var data = $.parseJSON(e.data)
        //findBounds(data.f)
        c_in++
        scaleInput(data)
        removeOldTouches(data.f)
        if (mode === 'draw') {
            drawPathFromTouches()
        } else {
            drawCursor()
        }
    }
    ws.onerror = function() {
        console.log('websocket error: ', ws)
    }
    ws.onclose = function() { 
        console.log('websocket closed', ws)
    }


})



