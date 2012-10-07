document.canvas = {}

var app = function() {


    function init() {
        canvas = $('#mainCanvas')
        paper.setup(canvas[0])
        pressureDrawTool.init()    
        canvas.on('mousemove', function(e){
            pressureDrawTool.drawSegment(Math.round(Math.random()*4), new paper.Point(e.pageX, e.pageY))
        })

        render()
    }

    function render(){
        paper.view.draw()
    }


    var pressureDrawTool = function() {

        var pathCount = 5 
        var paths = []
        var currentPath = 0

        init = function() {
            _(pathCount).times(function(i){
               console.log('paths intl', paths, canvas)
               paths.push(new paper.Path())
               console.log('paths intl', paths)
               paths[i].fillColor = new paper.HsbColor(Math.round(Math.random()*359), 0.9, 0.7)
            })    

        }
        
        function onQuit() {
            //tear down event listeners etc
        }
        
        drawSegment = function(pathIndex, newPoint) {

            
            var path = paths[pathIndex]
            console.log(paths)
            //var new_point = new paper.Point(event.pageX, event.pageY)
            var old_point = (path.lastSegment != null) ? path.lastSegment.getPoint() : new paper.Point()
            var delta = newPoint.subtract(oldPoint)
            var middlePoint = newPoint.subtract([delta.x/2, delta.y/2])
            var step = delta.divide(2)
            step.angle += 90
            
            var top = middlePoint.add(step)
            var bottom = middlePoint.subtract(step)

            path.add(top)
            path.insert(0, bottom)
            path.smooth()

            paper.view.draw()
        }
            
        return {
            init: init,
            onQuit: onQuit,
            drawSegment: drawSegment
        }
    }()


    return {
        init: init,
        render: render
    }
}()




$(document).ready(function(){
    
    app.init()

})