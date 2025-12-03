using Goals.Core.Context;
using Goals.Core.Entities;
using Goals.Repositories;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.ComponentModel;

namespace Goals.WinApp
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            Load += Form_Load;
            InitializeComponent();
        }

        private void Form_Load(object sender, EventArgs e)
        {
            var repository = new Repository<Goal, Guid>(new GoalsContext());

            foreach (var goal in repository.GetAll().ToList())
            {
                listBox1.Items.Add($"{goal.Season}, {goal.Competition}, {goal.Matchday}, {goal.Date.Date}, {goal.Venue}, {goal.Club}, {goal.Opponent}, {goal.Result}, {goal.Playing_Position}, {goal.Minute}, {goal.At_score}, {goal.Type}, {goal.Goal_assist}");
            }
        }

        private void UpdateList()
        {
            listBox1.Items.Clear();

            var repository = new Repository<Goal, Guid>(new GoalsContext());

            foreach (var goal in repository.GetAll().ToList())
            {
                listBox1.Items.Add($"{goal.Season}, {goal.Competition}, {goal.Matchday}, {goal.Date.Date}, {goal.Venue}, {goal.Club}, {goal.Opponent}, {goal.Result}, {goal.Playing_Position}, {goal.Minute}, {goal.At_score}, {goal.Type}, {goal.Goal_assist}");
            }
        }
        private void button1_Click(object sender, EventArgs e)
        {
            var repository = new Repository<Goal, Guid>(new GoalsContext());
            repository.Create(new Goal
            {
                Season = textBox1.Text,
                Competition = textBox2.Text,
                Matchday = textBox3.Text,
                Date = DateTime.Parse(textBox4.Text),
                Venue = textBox5.Text,
                Club = textBox6.Text,
                Opponent = textBox7.Text,
                Result = textBox8.Text,
                Playing_Position = textBox9.Text,
                Minute = textBox10.Text,
                At_score = textBox11.Text,
                Type = textBox12.Text,
                Goal_assist = textBox13.Text
            });
            UpdateList();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            var repository = new Repository<Goal, Guid>(new GoalsContext());
            while (listBox1.SelectedIndex != -1)
            {
                string selectedString = listBox1.SelectedItem.ToString();
                string[] words = selectedString.Split(", ");

                var goal = repository.GetAll().FirstOrDefault(w => w.Season == words[0] && w.Minute == words[9]);
                if (goal != null)
                {
                    var goalToDelete = repository.Get(goal.Id);
                    repository.Delete(goalToDelete);
                }

                UpdateList();
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            var repository = new Repository<Goal, Guid>(new GoalsContext());
            while (listBox1.SelectedIndex != -1)
            {
                string selectedString = listBox1.SelectedItem.ToString();
                string[] words = selectedString.Split(", ");

                var goal = repository.GetAll().FirstOrDefault(w => w.Season == words[0] && w.Minute == words[9]);
                if (goal != null)
                {
                    var goalToEdit = repository.Get(goal.Id);
                    goalToEdit.Season = textBox1.Text;
                    goalToEdit.Competition = textBox2.Text;
                    goalToEdit.Matchday = textBox3.Text;
                    goalToEdit.Date = DateTime.Parse(textBox4.Text);
                    goalToEdit.Venue = textBox5.Text;
                    goalToEdit.Club = textBox6.Text;
                    goalToEdit.Opponent = textBox7.Text;
                    goalToEdit.Result = textBox8.Text;
                    goalToEdit.Playing_Position = textBox9.Text;
                    goalToEdit.Minute = textBox10.Text;
                    goalToEdit.At_score = textBox11.Text;
                    goalToEdit.Type = textBox12.Text;
                    goalToEdit.Goal_assist = textBox13.Text;
                    repository.Update(goalToEdit);
                }

                UpdateList();
            }
        }

        private void textBox3_TextChanged(object sender, EventArgs e)
        {

        }

        private void listBox1_SelectedIndexChanged(object sender, EventArgs e)
        {

        }

        private void textBox14_TextChanged(object sender, EventArgs e)
        {

        }

        private void button4_Click(object sender, EventArgs e)
        {
            listBox2.Items.Clear();
            var repository = new Repository<Goal, Guid>(new GoalsContext());
            var goal = repository.GetAll().FirstOrDefault(w => w.Matchday == textBox14.Text && w.Season == textBox15.Text && w.Minute == textBox16.Text);
            if (goal != null)
                listBox2.Items.Add($"{goal.Season}, {goal.Competition}, {goal.Matchday}, {goal.Date.Date}, {goal.Venue}, {goal.Club}, {goal.Opponent}, {goal.Result}, {goal.Playing_Position}, {goal.Minute}, {goal.At_score}, {goal.Type}, {goal.Goal_assist}");

        }
    }
}