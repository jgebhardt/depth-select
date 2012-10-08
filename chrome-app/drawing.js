var app = { fps: 30, forceFactor: 0.1 }

//draw, select, setcolor
var mode = 'draw' 
var currentTouches = []
var lastTouchTime = 0
var selectedPath = null
var touchThatSelected = null
    /* SETUP */


    var setupCanvas = function() {
        app.canvas = $('#mainCanvas')
        paper.setup(app.canvas[0])
        
        app.mainview = paper.view
        //app.mainview.activate()
        //app.v1 = paper.
        
        //= app. new paper.View('touchVizCanvas')
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

    var clearDrawing = function() {
        paper.project.activeLayer.removeChildren()
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
        var previousLayer = paper.project.activeLayer
        app.cursorLayer = new paper.Layer()
        app.cursorLayer.activate()

        var pos = new paper.Point(10,10)
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

        previousLayer.activate()        
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
        var previousLayer = paper.project.activeLayer
        app.cursorLayer.activate()

        var pos = new paper.Point(0,0)
        var radius = 5
        var bg = new paper.Path.Circle(pos, radius)
        bg.name = 'bg'
        bg.fillColor = new paper.HsbColor(0,0,0)
        bg.opacity = 0.2
        var dot = new paper.Path.Circle(pos, 1)
        dot.fillColor = new paper.HsbColor(0,0,0)
        app.cursor = new paper.Group([bg, dot])
        app.cursor.opacity = 0
        app.cursor.scale = 1
        previousLayer.activate()
    }

    var drawCursor = function(pos) {
            app.cursor.opacity = 1
            app.cursor.position.setX(pos.x)
            app.cursor.position.setY(pos.y)
            var newscale = 1 + 0.1*currentTouches[0].forceAverage
            app.cursor.children['bg'].scale(newscale/app.cursor.scale)
            app.cursor.scale = newscale
    }


    var draw = function() {
            app.mainview.activate()

        $('#msg-list .msg').html(printTouches())
        if (mode == 'select' && currentTouches.length >= 2) {
            drawSeesaw(getPressureBalance(currentTouches[0], currentTouches[1]))
        } else {
            hideSeesaw()
        }
        if (mode == 'select') {
            if (currentTouches.length > 0){
                var cursorPosition = new paper.Point(currentTouches[0].x, currentTouches[0].y)
                if(touchThatSelected == null) {
                    doHitTest(cursorPosition)
                }
                drawCursor(cursorPosition)
            } 
            if (new Date().getTime() - lastTouchTime > 200) {
                hideLayerMenu()
            }
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

    var clearAllTouches = function() {
        _(currentTouches).each(function(touch){
            if (touch.path != null) touch.path.closePath()
        })
        currentTouches = []
    }

    var removeOldTouches = function(data) {
        toBeRemoved = []
        _(currentTouches).each(function(touch){
            var matchcount = 0
            _(data).each(function(rawtouch){
                
                if (rawtouch[0] === touch.id) { matchcount++ }
            })
            if (matchcount===0) {
                if (touch.path != null) touch.path.closePath()
                if (touch.id == touchThatSelected) {touchThatSelected = null}
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
        var touchCountBefore = currentTouches.length
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

        if( selectedPath != null && currentTouches.length > touchCountBefore)  {
            //console.log('pick mode!')
            //hideLayerMenu()
            onLayerSelect()
        }
    }

    var activePath
    var doHitTest = function(pos) {
        var hitOptions = {
            //segments: true,
            //stroke: true,
            fill: true//,
            //tolerance: true
        }

        paper.project.activeLayer.selected = false;

        hitResults = []
        _(paper.project.activeLayer.children).each(function(child){
            var test = child._hitTest(pos,hitOptions);
            if(test != null){
                hitResults.push(test)
            } 
        })
        
        _(hitResults).each(function(hit){
            if (hit.item) {
                hit.item.opacity = 1
            }
        })
        

        buildLayerList(_(hitResults).reverse())
        /*
        var hitResult = paper.project.activeLayer.hitTest(pos, hitOptions);
        paper.project.activeLayer.selected = false;
        //if (hitResult != null) console.log('hit:', hitResult)
        if (hitResult && hitResult.item && true ){//hitResult.item.layer != app.cursorLayer) {
            hitResult.item.selected = true;
        }
        */
    }

    var maxSelectForce = 200

    var getSelectedIndex = function(itemCount, force, forceThreshold) {
        var sliceSize = (maxSelectForce + 1 - forceThreshold) / itemCount
        return Math.min(Math.floor((force-forceThreshold) / sliceSize), itemCount-1)
    }

    var getSelectionForceGradientCSS = function(percentage){
        var output = '-webkit-gradient(' +
                'linear,' +
                'left top,' +
                'left bottom, ' +
                'color-stop(' + (percentage-0.1) + ', rgb(68,68,68)),' +
                'color-stop(' + (percentage-0.01) + ', rgb(143,44,53)),' +
                'color-stop(' + percentage + ', rgb(255,44,53)),' +
                'color-stop(' + (percentage+0.01) + ', rgb(143,44,53)),' +
                'color-stop(' + (percentage+0.1) + ', rgb(68,68,68))' +
            ')'
        return output
    }

    var buildLayerList = function(hitResults){
        if (currentTouches.length > 0){
            var output = ''
            var force = currentTouches[0].forceAverage
            var forceThreshold = 25
            var layerCount = hitResults.length

            //show layerlist only if multiple layers are present and touch has increased pressure
            if (layerCount > 1 && force >= forceThreshold) {
                
                $('#layerlist').show().css('top', currentTouches[0].y).css('left', currentTouches[0].x+50)
                var selectedLayerIndex = getSelectedIndex(layerCount, force, forceThreshold)
                if(hitResults[i]) {selectedPath = hitResults[i].item}
                //console.log('selected:', selectedLayerIndex)
                for (i=0; i<layerCount; i++) {
                    if (i ==selectedLayerIndex) {
                        var layer = hitResults[i]
                        if (layer) {
                            layer.item.selected = true
                            selectedPath = layer.item
                        }    
                        output += '<li class="active">'
                    } else {
                        output += '<li>'    
                        if (i <= selectedLayerIndex) {
                            var layer = hitResults[i]
                            if (layer) {
                                var before = layer.item.opacity
                                layer.item.opacity = Math.min(1, 1/(i+2)/selectedLayerIndex + 0.10)
                            }
                        }
                    }                   
                    output += 'Layer ' + i + '</li>'
                }
                $('#layerlist ul.layers').html(output)
                $('.vIndicator').css({'background': getSelectionForceGradientCSS((force-forceThreshold) / maxSelectForce)})
            } else {
                $('#layerlist').hide()
            }
        }
    }

    var hideLayerMenu = function (){
        $('#layerlist').hide()
        _(paper.project.activeLayer.children).each(function(child){
            child.opacity = 1
        })
        app.cursor.opacity = 0
        selectedPath = null
    }

    var checkIfSelected = function() {
        _(currentTouches).each(function(touch){
            if (touch.id == touchThatSelected) {
                return true
            }
        })
        return false
    }

    var onLayerSelect = function(){
        console.log('selected', selectedPath)
        hideLayerMenu()
        touchThatSelected = currentTouches[0].id
        console.log(touchThatSelected)

        //$('#color-window').show()
        //var picker = document.getElementById('colorpicker').color.showPicker()

    }

    /* HELPERS */

    //costruct html table string for touch matrix output
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
        if (mode != modestring) {
            app.cursor.opacity = 0
            mode = modestring
            console.log(mode)
            $('.navbar li.active').removeClass('active')
            switch(mode) {
                case 'draw':  $('#linkModeDraw').addClass('active') ;break;
                case 'select':  $('#linkModeSelect').addClass('active'); break;
            }
            clearAllTouches()
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
    $('.wnd').draggable({ cursor: "crosshair" });
    

    /* RAUNAQ TOUCH VIZ*/
    
    //app.touchviz = new paper.View('c1')
    //app.touchviz.activate()
    
    //var x = paper.Path.Line(new paper.Point(0,0), new paper.Point(1000,1000))
    //x.strokeColor = new paper.HsbColor(0,0,0)
    
    //canvas_setup()
    //p1_draw()
    //parse_json('{"f":[[0,0,0,100,50],[1,20,20,100,40],[2,30,30,100,20],[3,60,60,100,50],[4,100,130,200,100]]}');
    //draw_on_input();

    //app.mainview.activate()

    
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
        //$('#msg-list').append($(''))
    }
    ws.onmessage = function (e) {
        //console.log(e.data)
        var data = $.parseJSON(e.data)
        //findBounds(data.f)
        c_in++
        scaleInput(data)
        removeOldTouches(data.f)
        lastTouchTime = new Date().getTime()
        if (mode === 'draw') {
            drawPathFromTouches()
        } else {
            if (currentTouches.length > 0){
                var cursorPosition = new paper.Point(currentTouches[0].x, currentTouches[0].y)
                
                //doHitTest(cursorPosition)
                //drawCursor(cursorPosition)
            }
        }
    }
    ws.onerror = function() {
        console.log('websocket error: ', ws)
    }
    ws.onclose = function() { 
        console.log('websocket closed', ws)
    }


})



