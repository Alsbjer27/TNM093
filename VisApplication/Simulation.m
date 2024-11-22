%% 1. Problem Setup
%  We need to simulate two masses connected by:
%       A spring (based on Hooke's Law)
%       A damper (damping fore proportional to relative velocity)

%% 2. MATLAB Implementation of Two Masses
% Given these parameters from the LAB_PM
m = 0.2;          % Mass 
k = 20;           % Spring stiffness
b = 0.6;          % Damping coefficient
L0 = 1;           % Rest length of the spring

% Loop intervall
h = 0.01;         % Time step
tf = 10;          % Total simulation time

% Time vector
t = 0:h:tf;

% Initial conditions
r1 = 0;           % Position of mass 1 
r2 = 1.5;         % Position of mass 2 
v1 = 0;           % Velocity of mass 1 
v2 = 0;           % Velocity of mass 2 



% Arrays to store positions
r1_array = zeros(size(t));
r2_array = zeros(size(t));

% Initialize positions
r1_array(1) = r1;
r2_array(1) = r2;

% Create figure for animation
figure;
hold on;
grid on;
xlim([-1, 3]); % Adjust based on expected positions
ylim([-0.5, 0.5]); % To focus on horizontal motion
xlabel('Position (m)');
ylabel('Time Step');
title('Animation of Two Masses Connected by Spring and Damper');
mass1 = scatter(r1, 0, 100, 'r', 'filled'); % Mass 1
mass2 = scatter(r2, 0, 100, 'b', 'filled'); % Mass 2
spring = plot([r1, r2], [0, 0], 'k', 'LineWidth', 2); % Spring

% Simulation loop
for n = 1:length(t)-1

    % Compute spring force
    delta_r = r2 - r1;               % Displacement
    Fs = -k * (delta_r - L0);        % Spring force
    
    % Compute damping force
    Fb = -b * (v1 - v2);             % Damping force
    
    % Total forces on each mass
    F1 = -Fs + Fb;                   % Force on mass 1
    F2 = Fs - Fb;                    % Force on mass 2
    
    % Acceleration
    a1 = F1 / m;
    a2 = F2 / m;
    
    % Euler Start

    % Update velocities
    v1 = v1 + h * a1;
    v2 = v2 + h * a2;
    
    % Update positions
    r1 = r1 + h * v1;
    r2 = r2 + h * v2;
    
    % Euler Stop

    % Store positions
    r1_array(n+1) = r1;
    r2_array(n+1) = r2;
    
    % Update animation
    set(mass1, 'XData', r1); % Update position of mass 1
    set(mass2, 'XData', r2); % Update position of mass 2
    set(spring, 'XData', [r1, r2]); % Update spring line
    pause(0.01); % Pause for a short duration to control animation speed
end

% Final static plot (optional)
figure;
plot(t, r1_array, 'r', 'LineWidth', 2); hold on;
plot(t, r2_array, 'b', 'LineWidth', 2);
xlabel('Time (s)');
ylabel('Position (m)');
legend('Mass 1', 'Mass 2');
title('Motion of Two Masses Connected by a Spring and Damper');
grid on;

%% 3. MATLAB Implementation of Four Masses

% Parameters
m = 0.2;          % Mass (kg)
k_struct = 15;    % Structural spring stiffness (N/m)
k_shear = 5;      % Shear spring stiffness (N/m)
b_struct = 0.5;  % Structural damping coefficient (N·s/m)
b_shear = 0.2;   % Shear damping coefficient (N·s/m)
L0_struct = 1;    % Structural spring rest length (m)
L0_shear = sqrt(2); % Shear spring rest length (m)
h = 0.001;        % Time step (s) - Reduced for stability
tf = 5;           % Total simulation time (s)

% Initial positions (2x2 grid)
r = [0, 0; 1.0005, 0; 0, 1.0005; 1.0005, 1.0005]; % Masses 1-4
v = zeros(4, 2);              % Velocities

% Time vector
t = 0:h:tf;

% Arrays to store positions over time
r_history = zeros(length(t), 4, 2);
r_history(1, :, :) = r;

% Structural spring connections
connections_struct = [1, 2; 1, 3; 2, 4; 3, 4];
% Shear spring connections
connections_shear = [1, 4; 2, 3];

% Simulation loop
for n = 1:length(t)-1
    % Initialize forces on each mass
    F = zeros(4, 2);
    
    % Structural springs
    for c = 1:size(connections_struct, 1)
        i = connections_struct(c, 1);
        j = connections_struct(c, 2);
        delta_r = r(j, :) - r(i, :);
        L = norm(delta_r);
        dir = delta_r / L;
        Fs = -k_struct * (L - L0_struct) * dir;
        Fb = -b_struct * (v(j, :) - v(i, :));
        F(i, :) = F(i, :) + Fs + Fb;
        F(j, :) = F(j, :) - Fs - Fb;
    end
    
    % Shear springs
    for c = 1:size(connections_shear, 1)
        i = connections_shear(c, 1);
        j = connections_shear(c, 2);
        delta_r = r(j, :) - r(i, :);
        L = norm(delta_r);
        dir = delta_r / L;
        Fs = -k_shear * (L - L0_shear) * dir;
        Fb = -b_shear * (v(j, :) - v(i, :));
        F(i, :) = F(i, :) + Fs + Fb;
        F(j, :) = F(j, :) - Fs - Fb;
    end
  

    % Update velocities and positions (Euler Method)
    a = F / m;
    v = v + h * a;
    r = r + h * v;
    
    % Store positions
    r_history(n+1, :, :) = r;
end

% Animation
figure;
hold on;
grid on;
xlim([-1, 2]); ylim([-1, 2]);
xlabel('X Position'); ylabel('Y Position');
title('Motion of 4 Masses Connected by Springs');
masses = scatter(r(:, 1), r(:, 2), 100, 'filled'); % Masses
springs = gobjects(6, 1); % 4 structural + 2 shear springs

% Initial spring lines
springs(1) = plot([r(1, 1), r(2, 1)], [r(1, 2), r(2, 2)], 'k'); % Mass 1-2
springs(2) = plot([r(1, 1), r(3, 1)], [r(1, 2), r(3, 2)], 'k'); % Mass 1-3
springs(3) = plot([r(2, 1), r(4, 1)], [r(2, 2), r(4, 2)], 'k'); % Mass 2-4
springs(4) = plot([r(3, 1), r(4, 1)], [r(3, 2), r(4, 2)], 'k'); % Mass 3-4
springs(5) = plot([r(1, 1), r(4, 1)], [r(1, 2), r(4, 2)], 'b'); % Shear 1-4
springs(6) = plot([r(2, 1), r(3, 1)], [r(2, 2), r(3, 2)], 'b'); % Shear 2-3

for n = 1:length(t)
    % Update positions in animation
    set(masses, 'XData', r_history(n, :, 1), 'YData', r_history(n, :, 2));
    set(springs(1), 'XData', [r_history(n, 1, 1), r_history(n, 2, 1)], ...
                    'YData', [r_history(n, 1, 2), r_history(n, 2, 2)]);
    set(springs(2), 'XData', [r_history(n, 1, 1), r_history(n, 3, 1)], ...
                    'YData', [r_history(n, 1, 2), r_history(n, 3, 2)]);
    set(springs(3), 'XData', [r_history(n, 2, 1), r_history(n, 4, 1)], ...
                    'YData', [r_history(n, 2, 2), r_history(n, 4, 2)]);
    set(springs(4), 'XData', [r_history(n, 3, 1), r_history(n, 4, 1)], ...
                    'YData', [r_history(n, 3, 2), r_history(n, 4, 2)]);
    set(springs(5), 'XData', [r_history(n, 1, 1), r_history(n, 4, 1)], ...
                    'YData', [r_history(n, 1, 2), r_history(n, 4, 2)]);
    set(springs(6), 'XData', [r_history(n, 2, 1), r_history(n, 3, 1)], ...
                    'YData', [r_history(n, 2, 2), r_history(n, 3, 2)]);
    pause(0.01);
end







