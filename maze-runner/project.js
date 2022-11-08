import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);


    }
}
class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
        };

        // *** Materials
        this.materials = {
            //ball
            sphere: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: .6, color: color(1, 1, 1, 1)}),
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.


        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(5, -10, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class Project extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("left", ["h"], () => {
            this.is_left
        });


        // Add a button for controlling the scene.
        this.key_triggered_button("right", ["k"], () => {
            this.is_right
        });


        this.key_triggered_button("forward", ["u"], () => {
            this.is_forward
        });

        this.key_triggered_button("back", ["j"], () => {

            this.is_back

        });

    }
    display(context, program_state) {
        super.display(context, program_state);
        const gray = hex_color("#808080");
        let model_transform = Mat4.identity();

        //draw box
        for (let i = 0; i < 50; i++) {
            model_transform = model_transform.times(Mat4.translation(0, 0, -1));

            //right border
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(16, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(16, 2, 0)), this.materials.plastic.override({color: gray}));

            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(8, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(6, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(4, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(2, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(0, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-2, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-6, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-10, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-12, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-14, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-16, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-18, 0, 3)), this.materials.plastic.override({color: gray}));

            //left border
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-26, 0, 0)), this.materials.plastic.override({color: gray}));
            this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-26, 2, 0)), this.materials.plastic.override({color: gray}));
        }
    }
}
