import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Project extends Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */

    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };

        // Variables global to the scene
        this.avatar_transform = Mat4.translation(0, 3, 0);
        this.MOVE_RATE = 0.2;
    }
    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("left", ["h"], () => {
            this.avatar_transform = Mat4.translation(-this.MOVE_RATE, 0, 0).times(this.avatar_transform);
        });

        this.key_triggered_button("right", ["k"], () => {
            this.avatar_transform = Mat4.translation(this.MOVE_RATE, 0, 0).times(this.avatar_transform);
        });

        this.key_triggered_button("forward", ["u"], () => {
            this.avatar_transform = Mat4.translation(0, 0, -this.MOVE_RATE).times(this.avatar_transform);
        });

        this.key_triggered_button("back", ["j"], () => {
            this.avatar_transform = Mat4.translation(0, 0, this.MOVE_RATE).times(this.avatar_transform);
        });
    }
    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            // COMMENTED TO PREVENT CAMERA MOVEMENT CONTROLS
            // this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(5, -10, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];





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

        this.shapes.sphere.draw(context, program_state, this.avatar_transform, this.materials.plastic);
    }
}
